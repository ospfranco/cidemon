import Foundation
import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate, NSUserNotificationCenterDelegate {
  var myWindowDelegate: MyNSWindowDelegate!
  var popover: NSWindow!
  var window: NSWindow!
  var statusBarItem: NSStatusItem!
  var reactNativeBridge: ReactNativeBridge!
  var controller: ReactViewController!
  
  func applicationDidFinishLaunching(_ aNotification: Notification) {
    reactNativeBridge = ReactNativeBridge()
    controller = ReactViewController(moduleName: "cidemon", bridge: reactNativeBridge.bridge)
    
    var screenHeight = CGFloat(800)
    if(NSScreen.main != nil) {
      screenHeight = NSScreen.main!.frame.height
    }
    
    let windowHeight = Int(min(screenHeight / 1.5, 700))
    let windowWidth = Int(min(screenHeight, 600))
    
    popover = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 1, height: 1),
      styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
      backing: .buffered, defer: false)
    
    popover.titlebarAppearsTransparent = true
    popover.titleVisibility = .hidden
    popover.isMovableByWindowBackground = false
    popover.isReleasedWhenClosed = false
    popover.collectionBehavior = [.transient, .ignoresCycle]
    popover.standardWindowButton(.closeButton)?.isHidden = true
    popover.standardWindowButton(.zoomButton)?.isHidden = true
    popover.standardWindowButton(.miniaturizeButton)?.isHidden = true
    popover.contentViewController = controller
    
    self.myWindowDelegate = MyNSWindowDelegate(resignHandler: {
      self.hidePopover()
    })
    popover.delegate = myWindowDelegate

    statusBarItem = NSStatusBar.system.statusItem(withLength: CGFloat(NSStatusItem.variableLength))
    
    if let button = self.statusBarItem.button {
      button.imagePosition = NSControl.ImagePosition.imageLeft
      button.image = NSImage(named: "initial")
      button.action = #selector(togglePopover(_:))
    }
  
    NSUserNotificationCenter.default.delegate = self
    
  //  #if DEBUG
  //  window = NSWindow(
  //    contentRect: NSRect(x: 0, y: 0, width: 1, height: 1),
  //    styleMask: [.titled, .closable, .miniaturizable, .resizable],
  //    backing: .buffered,
  //    defer: false)

  //   window.contentViewController = controller
  //   window.center()
  //   window.setFrameAutosaveName("CI Demon")
  //   window.isReleasedWhenClosed = false
  //   let screen: NSScreen = NSScreen.main!
  //   let midScreenX = 600
  //   let posScreenY = screen.frame.height
  //   let origin = CGPoint(x: Int(midScreenX), y: Int(posScreenY))
  //   let size = CGSize(width: 600, height: 700)
  //   let frame = NSRect(origin: origin, size: size)
  //   window.setFrame(frame, display: true)
  //   window.makeKeyAndOrderFront(self)
  //   #endif

  }
  
  func userNotificationCenter(_ center: NSUserNotificationCenter, didActivate notification: NSUserNotification) {
    let url = URL(string: notification.userInfo!["url"] as! String)!
    NSWorkspace.shared.open(url)
  }
  
  @objc func togglePopover(_ sender: AnyObject?) {
    if self.popover.isVisible && self.popover.isKeyWindow {
      self.popover.close()
    
    } else {
    
      self.popover.makeKeyAndOrderFront(self)
      self.popover.center()
      if !NSApp.isActive {
        NSApp.activate(ignoringOtherApps: true)
      }
      let screen: NSScreen = NSScreen.main!
      let midScreenX = self.statusBarItem.button!.window!.frame.origin.x - 300
      let posScreenY = screen.frame.height
      let origin = CGPoint(x: Int(midScreenX), y: Int(posScreenY))
      let size = CGSize(width: 600, height: 700)
      let frame = NSRect(origin: origin, size: size)
      self.popover.setFrame(frame, display: true)
    }
  }
  
  @objc func hidePopover() {
    if self.popover.isVisible {
      self.popover.close()
    }
  }
  
//  @objc func showPopover(_ sender: AnyObject?) {
//    if !(self.mainWindow.isVisible && self.mainWindow.isKeyWindow) {
//      self.hotKey.isPaused = false
//      self.mainWindow.makeKeyAndOrderFront(self)
//      self.mainWindow.center()
//      if !NSApp.isActive {
//        NSApp.activate(ignoringOtherApps: true)
//      }
//    }
//  }
  
  func setStatusText(failed: NSInteger, running: NSInteger, passed: NSInteger, useSimpleIcon: Bool) {
    if(useSimpleIcon) {
      if let button = self.statusBarItem.button {
        if(running > 0) {
          button.image = NSImage(named: "simple_pending")
        } else if(failed > 0) {
          button.image = NSImage(named: "simple_failed")
        } else if(running > 0) {
          button.image = NSImage(named: "simple_passed")
        } else {
          button.image = NSImage(named: "simple_initial")
        }
      }
      return
    }
    
    var statuses: [String] = []
    if(running > 0) {
      statuses.append("pending")
    }
    if(failed > 0) {
      statuses.append("failed")
    }
    if(passed > 0) {
      statuses.append("passed")
    }
    
    if let button = self.statusBarItem.button {
      if(statuses.count > 0) {
        button.image = NSImage(named: statuses.joined(separator: "_"))
      } else {
        button.image = NSImage(named: "initial")
      }
    }
  }
  
  func closeApp() {
    NSApp.terminate(nil)
  }
  
  func getWindowObject() -> NSView {
    return controller.view
  }
}
