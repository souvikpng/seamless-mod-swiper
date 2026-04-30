Disclaimer: Readme is outdated, but the general functionality is the same. Will update later.

# Seamless Mod Swiper

Tinder'esque Application to Help Catalogue Your Mod List.

**The Issue:**

Nexus Mods's current UX and sorting function is pure undiluted dogshit now and they intend on keeping it that way, which makes browsing mods difficult.

**What This Application Does:**

There's a good chance you've used dating apps. This is essentially that but for mods. You see a mod, and you swipe.

* Mods you swipe **right** are "approved".
* Mods you swipe **left** are "discarded".
* Approved mods are listed on a sidebar for easy perusal, and can be exported to a text document.

The purpose of this tool is to help streamline the process of "choosing" mods. Basically get a clear idea of what you'll be working with.

**Supported Games & Data:**

* Currently supports **Cyberpunk 2077** and **Red Dead Redemption 2**.
* Mod "card" order is **random** every session.
* Your list of approved mods persists between sessions.

**What This Application Does NOT Do:**

* Help you install mods.
* Help you figure out mod cross-compatibility.
* Identify mod prerequisites.

By design, these tasks are left up to the user.

**Disclaimer:**

This application requires a Nexus Mods API key for functionality.

I know nothing about programming, and as such the code has been written entirely by AI (at least for the time being). However, I'm confident about its functionality on top of it being a simple tool. No hard feelings if this is a dealbreaker, I suggest moving on. Expect this tool to be frequently refined and updated.

**Data & Persistence**

* Approved mods and settings persist between sessions.
* Desktop: Files stored next to executable with integrity checks.
* Export/Import to JSON available.
* **API key never stored or persisted**.
* No telemetry.

## Security Notes

* The Nexus Mods API key is kept in memory only and is not persisted.
* The app stores approved/seen mod metadata locally in browser storage.
* Fonts are self-hosted through local package assets to preserve the look without third-party runtime requests.
* Remote mod images are restricted to known Nexus Mods image hosts and use `no-referrer` requests.
* Do not run `npm run dev:lan` on untrusted networks.
* Production builds should be served over HTTPS with the CSP in `index.html`; a response header is preferable when the host supports it.
* The CSP still allows inline styles because the current React animation/UI layer uses style attributes; avoid introducing raw HTML sinks or remote scripts.
* If CDN-hosted scripts or styles are introduced later, require SRI and a CSP update in the same change.

**License**

Idk about licenses and stuff go nuts its open source.

**Contributing**

Contributions welcome! Please open issues for bugs or feature requests.
