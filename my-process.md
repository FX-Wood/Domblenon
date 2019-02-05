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

