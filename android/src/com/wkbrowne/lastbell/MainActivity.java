package com.wkbrowne.lastbell;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.webkit.JavascriptInterface;
import java.util.Locale;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Full-screen shell that runs the bundled game; nothing is loaded from the network except fonts. */
public class MainActivity extends Activity {
    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        // The reading voice's files are served from the app's own assets under a made-up address,
        // because a page opened from a file cannot fetch other files directly.
        web.setWebViewClient(new WebViewClient() {
            @Override public android.webkit.WebResourceResponse shouldInterceptRequest(WebView v, android.webkit.WebResourceRequest rq) {
                android.net.Uri u = rq.getUrl();
                if (u == null || !"lastbell.local".equals(u.getHost())) return null;
                String path = u.getPath() == null ? "" : u.getPath().replaceFirst("^/+", "");
                java.util.Map<String, String> h = new java.util.HashMap<String, String>();
                h.put("Access-Control-Allow-Origin", "*");
                if (path.contains("..") || !path.startsWith("tts/")) return new android.webkit.WebResourceResponse("text/plain", "utf-8", 404, "Not Found", h, new java.io.ByteArrayInputStream(new byte[0]));
                String mime = path.endsWith(".js") ? "text/javascript" : path.endsWith(".wasm") ? "application/wasm" : path.endsWith(".json") ? "application/json" : "application/octet-stream";
                try { return new android.webkit.WebResourceResponse(mime, null, 200, "OK", h, getAssets().open(path)); }
                catch (Exception e) { return new android.webkit.WebResourceResponse("text/plain", "utf-8", 404, "Not Found", h, new java.io.ByteArrayInputStream(new byte[0])); }
            }
        });
        // listening questions and "read to me" use the tablet's own voice
        web.addJavascriptInterface(new Speech(), "LBSpeech");
        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override public void onInit(int status) {
                if (status != TextToSpeech.SUCCESS) return;
                int lang = tts.setLanguage(Locale.US);
                if (lang == TextToSpeech.LANG_MISSING_DATA || lang == TextToSpeech.LANG_NOT_SUPPORTED) return;
                tts.setSpeechRate(0.9f);
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { }
                    @Override public void onDone(String id) { speechDone(true); }
                    @Override public void onError(String id) { speechDone(false); }
                });
                ttsReady = true;
            }
        });
        web.setBackgroundColor(0xFF07060C);
        setContentView(web);
        if (state == null) web.loadUrl("file:///android_asset/index.html");
        else web.restoreState(state);
    }

    private void speechDone(final boolean ok) {
        runOnUiThread(new Runnable() {
            @Override public void run() { web.evaluateJavascript("window.lbSpeechDone && window.lbSpeechDone(" + ok + ")", null); }
        });
    }

    private class Speech {
        @JavascriptInterface public boolean ok() { return ttsReady; }
        @JavascriptInterface public void speak(String text) {
            if (!ttsReady) { speechDone(false); return; }
            if (tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "lb") != TextToSpeech.SUCCESS) speechDone(false);
        }
        @JavascriptInterface public void stop() { if (ttsReady) tts.stop(); }
        /** English voices that work offline, as JSON: name, language tag and the engine's own quality score. */
        @JavascriptInterface public String voices() {
            StringBuilder sb = new StringBuilder("[");
            try {
                if (ttsReady && tts.getVoices() != null) for (Voice v : tts.getVoices()) {
                    if (v == null || v.getLocale() == null || !"en".equals(v.getLocale().getLanguage())) continue;
                    if (v.isNetworkConnectionRequired()) continue;
                    if (v.getFeatures() != null && v.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                    if (sb.length() > 1) sb.append(',');
                    sb.append("{\"name\":\"").append(v.getName().replace("\"", "")).append("\",\"lang\":\"").append(v.getLocale().toLanguageTag()).append("\",\"q\":").append(v.getQuality()).append('}');
                }
            } catch (Exception e) { }
            return sb.append(']').toString();
        }
        @JavascriptInterface public void setup(String name, float rate, float pitch) {
            if (!ttsReady) return;
            try {
                tts.setSpeechRate(rate); tts.setPitch(pitch);
                if (name != null && name.length() > 0 && tts.getVoices() != null) for (Voice v : tts.getVoices()) if (v != null && name.equals(v.getName())) { tts.setVoice(v); break; }
            } catch (Exception e) { }
        }
    }

    private void immersive() {
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override
    public void onWindowFocusChanged(boolean focus) {
        super.onWindowFocusChanged(focus);
        if (focus) immersive();
    }

    @Override protected void onDestroy() { if (tts != null) tts.shutdown(); super.onDestroy(); }
    @Override protected void onPause() { if (ttsReady) tts.stop(); web.evaluateJavascript("typeof Snd!=='undefined'&&Snd.hide(true)", null); super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); immersive(); web.evaluateJavascript("typeof Snd!=='undefined'&&Snd.hide(false)", null); }
    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }
    @Override public void onBackPressed() { web.evaluateJavascript("Input.presses.push('b')", null); }
}
