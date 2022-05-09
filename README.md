# Checkers
Gaming application.
## Purpose
This game helps maintain and keep friends together by engaging them in one platform either online or offline. You can as well challenge yourself against the in-built Artificial Intelligence and see how good you are. This game can help improve your mental health by engaging your mind in critical thinking. 
## Installation
To install this app just visit [Checkers](https://mark-code789.github.io/Checkers/).

**Remember:** 
_some functions of this app require latest browser version to work._

After opening the link you will be prompted to install the app. For Chrome browsers, it will be installed natively while others such as Opera and UC brower will just the app to the homescreen without any native app privileges. Some browsers do not fire the `beforeInstallEvent` so be sure to install or add to homescreen manually.
## How it works
Checkers uses HTML elements and CSS 3D to represent the board. The actions and interactions are made and controlled by Javascript. 
AI is powered by `negascoust` algorithm with alpha beta pruning and iterative deepening optimizations.  
`workers` are used to provide a little bit of parallel processing and reduce the AI thinking time. 
`Transposition table` as well is used to also optimize the search time.
Online gaming is powered by [PUBNUB](https://www.pubnub.com). I used two `channels` to control the number of participants in the game _(2)_. One for accepting joining requests which checks the participants count in the other channel before subscribing them. The other is the main channel that has a maximum of _two_ participants at any given point. This channel controls the game and other functions such as chatting.
## Pros
- Supports online gaming. 
- Supports online conversations while gaming. 
- Works better than native apps.
- Multiple versions of the game with multiple levels. 
- Uses minimal storage space compared to native apps.
- Easy to update.
## Cons
- May lag in some devices. 
- The AI thinking time is dependent on the multithreading capability of the target device. Devices with many cores performs better.  
- I haven't included all the variations and flavors of the checkers game. 
- Requires latest browsers. if not, update is needed.
- Online gaming can be frustrating for slow networks. 
## Further Reading
- [How Negascout Algorithm works](https://en.m.wikipedia.org/wiki/Principal_variation_search#:~:text=Like%20alpha%2Dbeta%20pruning%2C%20NegaScout,to%20capitalize%20on%20this%20advantage.).
- [Alpha Beta pruning](https://en.m.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)
