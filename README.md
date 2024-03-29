<h1 align="center">CI Demon</h1>

<h3 align="center">A macOS menu bar application to monitor your CI jobs</h3>

![cidemon](https://user-images.githubusercontent.com/1634213/129091153-df219f7c-6094-497a-a4eb-17ecf7a0a4b5.png)

<div align="center">
  <pre align="center">
    <a href="https://apps.apple.com/de/app/ci-demon/id1560355863?mt=12h">Get it on the mac app store</a>
    Or build it yourself!
  </pre>
  <a align="center" href="https://github.com/ospfranco?tab=followers">
    <img src="https://img.shields.io/github/followers/ospfranco?label=Follow%20%40ospfranco&style=social" />
  </a>
  <br />
  <a align="center" href="https://twitter.com/ospfranco">
    <img src="https://img.shields.io/twitter/follow/ospfranco?label=Follow%20%40ospfranco&style=social" />
  </a>
</div>

<br/>

MacOS menu bar app that aggregates information and notifies you when your CI builds or deployments are broken (or restored), it shows you all the relevant information in a single native app, without having to wait for entire web apps to load.

Developed with react-native for macOS, if you know typescript you can easily contribute to it, if you want to add support for more providers, it is fairly straightforward, your CI needs to provide an API and you need only to write a few typescript functions.

## Supported providers

CI Demon currently supports the following CI providers:

- Github Checks
- CircleCI
- TravisCI
- Gitlab SaaS & self-managed
- AppCenter
- Bitrise

## Health Checks

CI Demon can also create http ping checks for you to make sure your deployment is still running, feature is really simple at the moment, send request -> check for OK response.

## All features

- Desktop notifications on failures/restorations
- Everything is stored encrypted in the macOS keychain
- Absolutely **NO** tracking
- Not a SaaS, it's a native macOS app
- Filter branches/builds by Regex
- Trigger rebuilds for builds
- Track Github PRs and/or branches
- Natively share a job to your team mates
- Filter Gitlab projects by visibility settings 
## License

MIT License
