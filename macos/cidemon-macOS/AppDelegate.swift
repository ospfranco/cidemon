import Foundation
import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate, NSUserNotificationCenterDelegate {
  var popover: NSPopover!
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
    let windowWidth = Int(min(screenHeight, 1000))

    popover = NSPopover()
    popover.contentSize = NSSize(width: windowWidth, height: windowHeight)
    popover.animates = true
    popover.behavior = .transient
    popover.contentViewController = controller

    #if DEBUG
    window = NSWindow(
          contentRect: NSRect(x: 0, y: 0, width: 1, height: 1),
          styleMask: [.titled, .closable, .miniaturizable, .resizable],
          backing: .buffered,
          defer: false)

    window.contentViewController = controller
    window.center()
    window.setFrameAutosaveName("CI Demon")
    window.isReleasedWhenClosed = false
    window.makeKeyAndOrderFront(self)
    let screen: NSScreen = NSScreen.main!
    let midScreenX = screen.frame.midX
    let posScreenY = 200
    let origin = CGPoint(x: Int(midScreenX), y: posScreenY)
    let size = CGSize(width: windowWidth, height: windowHeight)
    let frame = NSRect(origin: origin, size: size)
    window.setFrame(frame, display: true)
    #endif

    statusBarItem = NSStatusBar.system.statusItem(withLength: CGFloat(NSStatusItem.variableLength))

    if let button = self.statusBarItem.button {
      button.imagePosition = NSControl.ImagePosition.imageLeft
      button.image = NSImage(named: "initial")
      button.action = #selector(togglePopover(_:))
    }


    NSUserNotificationCenter.default.delegate = self
  }

  func userNotificationCenter(_ center: NSUserNotificationCenter, didActivate notification: NSUserNotification) {
    let url = URL(string: notification.userInfo!["url"] as! String)!
    NSWorkspace.shared.open(url)
  }

  @objc
  func togglePopover(_ sender: AnyObject?) {
      if let button = self.statusBarItem.button {
          if let popover = self.popover {
              if popover.isShown {
                  popover.performClose(sender)
              } else {
                  popover.show(relativeTo: button.bounds, of: button, preferredEdge: NSRectEdge.minY)

                  popover.contentViewController?.view.window?.becomeKey()
              }
          }
      }
  }

  func setStatusText(failed: NSInteger, running: NSInteger, passed: NSInteger) {
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
