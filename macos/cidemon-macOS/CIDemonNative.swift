import Foundation
import KeychainAccess
import ServiceManagement
import StoreKit
import LaunchAtLogin

extension Notification.Name {
    static let killLauncher = Notification.Name("killLauncher")
}

private let keychain = Keychain(service: "Tempomat Keychain")

@objc(CIDemonNative)
class CIDemonNative: NSObject, NSSharingServicePickerDelegate {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  func setStatusButtonText(_ failed: NSInteger, running: NSInteger, passed: NSInteger) {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      appDelegate?.setStatusText(failed: failed, running: running, passed: passed)
    }
  }

  @objc
  func securelyStore(_ key: NSString, payload: NSString, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    keychain[key as String] = payload as String
    resolver(true)
  }

  @objc
  func securelyRetrieve(_ key: NSString, resolver resolve: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    let value = keychain[key as String]
    return resolve(value)
  }

  @objc
  func sendNotification(_ title: NSString, payload: NSString, url: NSString) {
    let notification = NSUserNotification()
    notification.identifier = UUID().uuidString
    notification.subtitle = payload as String
    notification.title = title as String
    notification.userInfo = [
      "url": url
    ]
    notification.soundName = "default"

    NSUserNotificationCenter.default.deliver(notification)
  }

  @objc
  func applyAutoLauncher(_ startAtLogin: Bool) {
    LaunchAtLogin.isEnabled = startAtLogin
  }

  @objc
  func closeApp() {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      appDelegate?.closeApp()
    }
  }

  @objc
  func requestReview() {
    SKStoreReviewController.requestReview()
  }

  @objc
  func showShareMenu(_ x: NSInteger, y: NSInteger, text: NSString) {
    let sharingPicker = NSSharingServicePicker(items: [text])
    sharingPicker.delegate = self

    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      let window = appDelegate?.getWindowObject()
      if window != nil {
        sharingPicker.show(relativeTo: NSRect(x: x, y: y, width: 1, height: 1), of: window!, preferredEdge: .minY)
      }
    }
  }

  func sharingServicePicker(_ sharingServicePicker: NSSharingServicePicker, sharingServicesForItems items: [Any], proposedSharingServices proposedServices: [NSSharingService]) -> [NSSharingService] {
        guard let image = NSImage(named: NSImage.Name("copy")) else {
            return proposedServices
        }

        var share = proposedServices
        let customService = NSSharingService(title: "Copy Text", image: image, alternateImage: image, handler: {
            if let text = items.first as? String {
              NSPasteboard.general.clearContents()
              NSPasteboard.general.setString(text, forType: .string)
            }
        })

        share.insert(customService, at: 0)

        return share
    }
}
