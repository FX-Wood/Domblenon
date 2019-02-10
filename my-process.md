## Day 1
Over the weekend I hacked together something that resembles dominion in the browser. It consists of a Card class and a Player class and several functions.

I made a shuffle function that is as effective as the fisher-yates shuffle in terms of randomness but does not shuffle in place. 

Currently, there are some methods on the player class for draw, discard, trashing from the hand, etc.

There are no methods on the card class at this point. 

Should I extend the card class for each new card? This is a question I have been asking myself.

One challenge I am wrestling with:
  How do I relate the data structures in my script to the structure of my HTML? For example, a player's hand is represented in an array that is part of their class instance. In HTML their hand is represented by an array of divs with nested images. The HTML object does not have all of the same attributes as the card objects in the player's hand array.
  
I am considering scrapping the gui until I have a functioning game at the command line. Then maybe I can link this with the graphical component and only render the necessary elements.


## Day 2
Domblenon is up and running. I refactored to exclude a UI. This made it far easier to sort out where functions should go.

Supported operations include: 
  + Buying cards
  + Shuffling deck
  + Auto-playing treasures
  + Checking for game completion
  + Identifying winner

My next task is to implement the action phase. It is more complex than the buy phase given the current kingdom selection. Features that must be implemented:
  + Trashing cards
  + Action splits
  + Drawing cards (must test when deck and discard are empty)
  + Gaining cards out of turn

The current application structure should support these features, as I've been *trying* to keep it all in mind. We'll see.

You may notice that the repository now includes some testing infrastructure. I have been looking at how to implement some unit tests. I have heard of both Mocha and Chai before, and they both had a fair number of search hits for set-up questions. Looking forward to testing!

One thing I forgot to mention-- I tried to implement a debug logger with a function that only console.logs when the global flag is present. This didn't work very well-- any messages passed through appeared in the console as if they came from within the function declaration. Console.log is at least kind enough to pass the line where it is called to the chrome console. 

Also, I could no longer pass in items delimited with commas and have it spit them out.

It turns out that console.log is actually pretty great. 

## Day 3
Spent all day trying to implement a UI. After several hours of mucking around I settled on making a global object named UI that will hold references to all the important DOM elements that I will use throughout the script.

This allows me to write things like UI.hand.doSomething(). Cool!

I also gave the Card class a render method. It takes three parameters, an HTML node that it will be rendered on, an id that will be set in the node's id property, and a state, to indicate whether it has been played or not, etc.

Village is now implemented as well. It draws and increments actions.

## Day 4
As I kick off Domblenon this morning, it works pretty well. 

## Day 5
As the game is functioning for the most part, I have a few feature options to pursue:
  1. Implement more kingdom cards
     * easy: Laboratory, Festival, Market
     * medium: Moneylender, Remodel, Mine, Workshop, Poacher
     * hard: Council Room, Cellar, Vassal, Harbinger, Thief
     * mission: impossible: Throne room, Library, Moat, Militia, Sentry
  2. Set up continuous integration
  3. Set up some tests
  4. Make user's hand display in a fan
  5. Work on open issues:
     + Action click listener is attached to card border, not img
     + card__scroll class is not scrolling as expected

Afternoon update:
  Implemented Lab, Festival, Market, and Moneylender.
  Made a test for makeSupply function
  Published site on github pages
  Corrected action card click listener

In implementing moneylender, I've settled on a plan to generalize a UI trash selector function. It will have several parameters:
  0. Player who is trashing
  1. Area to select from
  2. Name of card that is trashing
  3. Filter for which cards may be selected
  4. Whether or not it's optional
  5. function to carry out depending on the result

Hopefully by constructing this function I can apply the same structure to other selectors. Having a generalized function for this would be really useful.
    
## Day 6
Game is stable, as far as I can tell. No errors in limited testing. All cards seem to behave as expected.
Missions for today:
  1. make one test
  2. implement 'Remodel'
  3. use remodel as template for supplySelector
  4. Using supply selector, implement:
     - implement 'Artisan'
     - implement 'Workshop'
     - implement 'Mine'
  5. implement 'Council Room'
  6. implement 'Throne Room'
  7. if there is time:
     - implement 'Sentry'

Tomorrow I will double-check requirements and start work on the presentation for Monday.

UI feature idea: Make stack counters for supply that have a numerical indicator as well as a percentage indicator (like a clock type thing for example)
Maybe also make this toggleable from the supply bar

EOD update:
- [x] Artisan
- [x] Workshop
- [x] Mine
- [x] Council room

Started to look at throne room, got very tired all of a sudden. 
Went to bed immediately!

## Day 7
I didn't get around to writing a test yesterday, so I wrote one this morning. It tests the CARDS resource, which is an object that holds all the arguments for constructing cards. Now if I don't enter a card correctly the test should catch it!

Next up: make sure all of my project requirement ducks are in a row:
- [x] Display a game in the browser
- [x] Switch turns between two players, or switch turns between a player and the computer (AI)*
- [ ] Design logic for winning & visually display which player won
  - [x] Game detects winning and endgame state
  - [ ] Game displays wins for users
- [x] Include separate HTML / CSS / JavaScript files
- [ ] Stick with KISS (Keep It Simple Stupid) and DRY (Don't Repeat Yourself) principles
- [x] Use Javascript or jQuery for DOM manipulation
- [x] Deploy your game online, where the rest of the world can access it**
- [x] Use semantic markup for HTML and CSS (adhere to best practices)
  - [x] Using <main> for body of app
  - [x] Using <header> for title bar and hand bar
  - [x] Using <section> for supply, player area, discard, and trash

Looks pretty good except for the endgame state. Currently the endgame is relayed to users in an alert box (blechh). I need to make a screen for the endgame that is pleasant to interact with.
#### Day 7 todos:
- [ ] make endgame screen
- [ ] make presentation
  - [ ] make an example gamestate that can be invoked during the presentation
- [ ] craft README.md
