// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager};

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let splash = app.get_webview_window("splashscreen");
      let main = app.get_webview_window("main");

      if let (Some(splash), Some(main)) = (splash, main) {
        std::thread::spawn(move || {
          std::thread::sleep(std::time::Duration::from_secs(2));

          // 1. Afficher la fenêtre principale
          main.show().unwrap();

          main.maximize().unwrap();

          // 2. Lui donner le focus
          main.set_focus().unwrap();

          // 3. La mettre temporairement au premier plan
          main.set_always_on_top(true).unwrap();
          std::thread::sleep(std::time::Duration::from_millis(200));
          main.set_always_on_top(false).unwrap();

          // 4. Fermer la splash
          splash.close().unwrap();
        });
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
