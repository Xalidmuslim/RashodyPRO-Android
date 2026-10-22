package ru.rashody.pro;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

@CapacitorPlugin(name = "FinanceStorage")
public class FinanceStoragePlugin extends Plugin {
  private static final String DB_NAME = "rashody_pro.db";
  private static final long MAX_SNAPSHOT_BYTES = 25L * 1024L * 1024L;
  private Store database;

  @Override public void load() { database = new Store(getContext()); }

  private static class Store extends SQLiteOpenHelper {
    Store(android.content.Context context) { super(context, DB_NAME, null, 1); }
    @Override public void onCreate(SQLiteDatabase db) {
      db.execSQL("CREATE TABLE IF NOT EXISTS kv(key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at INTEGER NOT NULL)");
    }
    @Override public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) { /* future migrations */ }
  }

  @PluginMethod public void readSnapshot(PluginCall call) {
    try {
      String snapshot = null;
      SQLiteDatabase db = database.getReadableDatabase();
      try(Cursor c = db.rawQuery("SELECT value FROM kv WHERE key=?", new String[]{"state"})) {
        if (c.moveToFirst()) snapshot = c.getString(0);
      }
      JSObject output = new JSObject();
      output.put("snapshot", snapshot == null ? JSONObject.NULL : snapshot);
      call.resolve(output);
    } catch (Exception error) { call.reject("Ошибка чтения Android SQLite", error); }
  }

  @PluginMethod public void writeSnapshot(PluginCall call) {
    try {
      String snapshot = call.getString("snapshot");
      if(snapshot == null || snapshot.length() == 0 || snapshot.getBytes(StandardCharsets.UTF_8).length > MAX_SNAPSHOT_BYTES) {
        call.reject("Недопустимый размер снимка финансовых данных"); return;
      }
      JSONObject json = new JSONObject(snapshot);
      if (!json.has("transactions") || !json.has("categories") || !json.has("settings")) {
        call.reject("Неполный снимок финансовых данных"); return;
      }
      SQLiteDatabase db = database.getWritableDatabase();
      db.beginTransaction();
      try {
        ContentValues values = new ContentValues();
        values.put("key", "state"); values.put("value", snapshot);
        values.put("updated_at", System.currentTimeMillis());
        long row = db.insertWithOnConflict("kv", null, values, SQLiteDatabase.CONFLICT_REPLACE);
        if(row < 0) throw new IllegalStateException("Снимок не записан");
        db.setTransactionSuccessful();
      } finally { db.endTransaction(); }
      call.resolve();
    } catch (Exception error) { call.reject("Ошибка записи Android SQLite", error); }
  }

  // Called from the user's tap on the plus button after HTML #txAmount has focus.
  // WebView focus() on its own is not always sufficient to open Android's IME.
  @PluginMethod public void showAmountKeyboard(PluginCall call) {
    Activity activity = getActivity();
    if (activity == null || getBridge() == null || getBridge().getWebView() == null) {
      call.reject("Android WebView недоступен"); return;
    }
    activity.runOnUiThread(() -> {
      android.webkit.WebView webView = getBridge().getWebView();
      webView.post(() -> {
        try {
          webView.requestFocus();
          android.view.inputmethod.InputMethodManager imm =
              (android.view.inputmethod.InputMethodManager) activity.getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
          boolean shown = imm != null && imm.showSoftInput(webView, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
          if (!shown) {
            // On Android 15/16 the IME can ignore the first implicit show request.
            androidx.core.view.WindowCompat.getInsetsController(activity.getWindow(), webView)
                .show(androidx.core.view.WindowInsetsCompat.Type.ime());
          }
          JSObject result = new JSObject();
          result.put("requested", true);
          call.resolve(result);
        } catch (Exception error) { call.reject("Не удалось открыть клавиатуру", error); }
      });
    });
  }

  // SAF dialog stores an exported JSON/CSV where the user chooses, with no storage permission.
  @PluginMethod public void exportFile(PluginCall call) {
    String content = call.getString("content");
    String filename = call.getString("filename");
    String mime = call.getString("mime");
    if(content==null || content.getBytes(StandardCharsets.UTF_8).length>MAX_SNAPSHOT_BYTES) {
      call.reject("Экспорт слишком большой"); return;
    }
    if(filename==null || filename.trim().isEmpty()) filename="rashody_backup.json";
    if(mime==null || mime.trim().isEmpty()) mime="application/octet-stream";
    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType(mime.split(";")[0]);
    intent.putExtra(Intent.EXTRA_TITLE, filename);
    startActivityForResult(call, intent, "exportFileResult");
  }

  @ActivityCallback private void exportFileResult(PluginCall call, ActivityResult result) {
    if(result.getResultCode()!=Activity.RESULT_OK || result.getData()==null){ call.reject("Экспорт отменён"); return; }
    Uri uri=result.getData().getData();
    if(uri==null){call.reject("Не выбран файл");return;}
    try {
      byte[] bytes=call.getString("content", "").getBytes(StandardCharsets.UTF_8);
      try(java.io.OutputStream stream=getContext().getContentResolver().openOutputStream(uri, "wt")) {
        if(stream==null) throw new IllegalStateException("Нет потока для записи");
        stream.write(bytes);stream.flush();
      }
      JSObject resultObject=new JSObject();resultObject.put("uri",uri.toString());call.resolve(resultObject);
    }catch(Exception error){call.reject("Ошибка экспорта через Android",error);}
  }
}
