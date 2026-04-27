use tauri::{Manager, LogicalSize}; 

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let splash = app.get_webview_window("splashscreen");
      let main = app.get_webview_window("main");

      if let (Some(splash), Some(main)) = (splash, main) {
        std::thread::spawn(move || {
          std::thread::sleep(std::time::Duration::from_secs(2));

          // 2. Définir la taille minimale avant ou après le show()
          // Ici on met par exemple 800x600
          main.set_min_size(Some(LogicalSize::new(600.0, 400.0))).unwrap();

          main.show().unwrap();
          main.maximize().unwrap();
          main.set_focus().unwrap();

          main.set_always_on_top(true).unwrap();
          std::thread::sleep(std::time::Duration::from_millis(200));
          main.set_always_on_top(false).unwrap();

          splash.close().unwrap();
        });
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}