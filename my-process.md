## Day 1
Over the weekend I hacked together something that resembles dominion in the browser. It consists of a Card class and a Player class and several functions.

I made a shuffle function that is as effective as the fisher-yates shuffle in terms of randomness but does not shuffle in place. 

Currently, there are some methods on the player class for draw, discard, trashing from the hand, etc.

There are no methods on the card class at this point. 

Should I extend the card class for each new card? This is a question I have been asking myself.

One challenge I am wrestling with:
  How do I relate the data structures in my script to the structure of my HTML? For example, a player's hand is represented in an array that is part of their class instance. In HTML their hand is represented by an array of divs with nested images. The HTML object does not have all of the same attributes as the card objects in the player's hand array.
  
I am considering scrapping the gui until I have a functioning game at the command line. Then maybe I can link this with the graphical component and only render the necessary elements.

