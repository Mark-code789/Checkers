# Checkers
Gaming application.
## Purpose
To overcome covid 19 challenges such as lack of physical contact by friends, social distance and quarantine. This game helps maintain and keep friends together by engaging then one platform either online irrespective of physical distance or offline.
## Installation
To install this app just visit [Checkers](https://mark-code789.github.io/Checkers/).

**Remember:** 
_some functions of this app require latest browser version to work._

After opening the link you will be prompted to install the app. For Chrome browsers version 89 and above will install the app natively while other browsers such as Opera and UC brower will just add the app to the homescreen. Some browsers do not fire the `beforeInstallEvent` so be sure to install or add to homescreen manually.
## How it works
Checkers uses HTML `tables` and CSS 3D to represent the board. The actions and interactions are made and controlled by Javascript. 
AI is powered by `minimax` algorithm with alpha beta pruning and iterative deepening optimizations.  
`workers` are used at later levels of the game which require much time to search for larger trees and deeper depths. 
Online gaming is powered by [PUBNUB](https://www.pubnub.com). I used two `channels` to control the number of participants in the game _(2)_. One for accepting joining requests which checks the participants count in the other channel before subscribing them. The other is the main channel that has a maximum of _two_ participants at any given point. This channel controls the game and other functions such as chatting.
## Pros
- Supports online gaming. 
- Supports online conversions while gaming. 
- Works better than native apps.
- Uses minimal storage space compared to native apps.
- Easy to update.
## Cons
- Some browsers do not give precise 3D position of pieces and cells on the board hence affecting board animations. 
- May take much time to search for a move for low memory(RAM) devices especially for later levels. 
- I haven't included all the variations and flavors of the checkers game. 
- Requires latest browsers. if not update is needed.
- Online gaming can be frustrating for slow networks. 
## Contributing
Thank you for supporting this project. Contributions and suggestions are welcomed to make this effective and efficient.  
I will highly appreciate contributions for: 
- Getting cross-browser precise location for pieces and cells.
- Making AI faster at deeper depths. i.e implementing effective **Transposition Tables**, **History Tables**, **Killer Moves** or use other algorithms.
- Possibility or advantages of using 3D Canvas to represent the board using **THREE.js**;

## Further Reading
- [How Minimax Algorithm works](https://en.m.wikipedia.org/wiki/Minimax)
- [Alpha Beta pruning](https://en.m.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)
