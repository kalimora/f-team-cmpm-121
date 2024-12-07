F2.a External DSL for Scenario Designs File:
This file defines different gameplay scenarios for our plant growth game.
Each scenario specifies starting conditions, weather patterns, victory conditions, and timed events.


The Tutorial scenario:
SCENARIO "Tutorial"
  START_CONDITIONS //Defining the initial state of the game
    GRID_SIZE 3  // Smaller grid for the tutorial
    PLAYER_POSITION 1 1  // Player starts in the center
    PLANT 0 0 TYPE 1 GROWTH 1  // A basic plant in the top-left corner
    PLANT 2 2 TYPE 2 GROWTH 2  // A slightly more advanced plant in the bottom-right

  END

  // The weather randomization policy affects the resource generation
  
  WEATHER
    SUN_RANGE 0 6  // Sun levels will be randomly generated between 0 and 6
    WATER_RANGE 0 2  // Water levels will be randomly generated between 0 and 2
  END

   // Events allow for fun changes during gameplay
  EVENTS
    AT_TIME 5 ADD_PLANT 1 1 TYPE 3  // Add a new plant at turn 5
    AT_TIME 10 INCREASE_WATER 2  // Increase water levels at turn 10
  END
END

The Challenge scenario:
SCENARIO "Challenge"
  START_CONDITIONS
    GRID_SIZE 5  // A larger grid 
    PLAYER_POSITION 2 2  // Player starts near the center
    PLANT 0 0 TYPE 1 GROWTH 1  // A basic plant in the top-left corner
    PLANT 4 4 TYPE 3 GROWTH 3  // An advanced plant in the bottom-right
  END

  WEATHER
    SUN_RANGE 1 8  # Wider range of sun levels for more variability
    WATER_RANGE 1 3  # Slightly higher water levels
  END

  VICTORY_CONDITION
    PLANTS_AT_LEVEL 4 5  # Player needs to grow 5 plants to level 4 (more challenging)
  END

   EVENTS
    AT_TIME 15 ADD_PLANT 2 2 TYPE 2  // Add a medium difficulty plant midway through
    AT_TIME 30 INCREASE_SUN 3  // Boost sun levels later in the game
  END
END

