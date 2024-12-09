# Devlog Entry - [11/16/2024]

## Introducing the team
Our team is composed of dedicated members each bringing unique skills and roles:
- **Kaylee Morales (Tools Lead)**: I'll be researching and setting up tools and configurations for the team, and helping with coding style guidelines and auto-formatting systems. I'll also support source control and deployment setups.
- **Hasina (Engine Lead)**: Hasina will oversee the creative direction and possibly the engine standards, teaching the team about our chosen engine and ensuring our game's design remains consistent.
- **Celeste (Design Lead)**: Celeste will assist in setting the creative vision, contributing to art and design elements, ensuring they align with our game's objectives.
- **Shea (Assistant Tools Lead)**: Supporting tool setups and configurations, and ensuring all team members are comfortable with our development environment.
- **Samina (Assistant Engine Lead)**: Focused on engine research and integration, making code examples, and maintaining the organization of our project's codebase.

## Tools and materials
- **Engine/Platform**: Phaser Library. We think that Phaser is good for the game we plan to make, and we all have experience developing with Phaser.
- **Programming Languages**: JavaScript or Typescript, as well as JSON as the data language. These languages are heavily used in the Phaser library, so these are the ones we will use. 
- **IDEs and Tools**: VScode as the IDE and potentially Aseprite to create assets. We all have experience with VScode so it would make sense to use this IDE and one member has experience with Aseprite and is willing to help other members learn as well. 
- **Alternate Platform**: As an alternative, we are considering using Unity, which would shift our primary scripting language to C# and alter our approach to handling game physics and rendering. 


## Outlook
- **Innovations**: We aim to integrate advanced NPCs that can adapt to player actions, which might be more complex than typical enemy designs.
- **Challenges**: The most challenging part will likely be ensuring smooth integration and performance optimization for different platforms.
- **Learning Goals**: We are excited to deepen our understanding of Godot and improve our proficiency in using the engine for complex game mechanics.

## Assets
- **Buttons:** https://prinbles.itch.io/robin
- **General:** https://cupnooble.itch.io/sprout-lands-asset-pack

## F0 Documentation
### F0.a - Shea
```
📦f-team-cmpm-121
 ┣ 📂.github
 ┃ ┗ 📂workflows
 ┃ ┃ ┗ 📜deno.yml           # workflow config
 ┣ 📂assets
 ┃ ┣ 📂audio                # audio assets
 ┃ ┗ 📂img                  # Sprites
 ┣ 📂lib
 ┃ ┗ 📜phaser.js
 ┣ 📂src
 ┃ ┣ 📂managers
 ┃ ┃ ┗ 📜TurnManager.js     # Turn-based simulation logic (F0.b, F0.d).
 ┃ ┃ ┗ 📜PlantManager.js    # Plant growth and interactions (F0.e, F0.f).
 ┃ ┣ 📂objects
 ┃ ┃ ┗ 📜Player.js          # Player logic and movement (F0.a)
 ┃ ┃ ┗ 📜GridCell.js        # Cell-specific logic (F0.c, F0.d).
 ┃ ┃ ┗ 📜Plant.js           # Plant-specific logic (F0.e, F0.f).
 ┃ ┣ 📂scenes
 ┃ ┃ ┣ 📜BootScene.js       # Preload assets, initial setup.
 ┃ ┃ ┗ 📜GameScene.js       # Main gameplay logic (F0.a–F0.g entry point).
 ┃ ┗ 📜main.js              # Game configuration module
 ┣ 📜deno.json              # deno configurations
 ┣ 📜index.css              # Styles
 ┣ 📜index.html             # Main HTML file
 ┗ 📜README.md
```
- I added a sprite sheet for the character in the BootScene.
- In the main scene (GameScene.js) I created logic for a 5x5 grid and an array to store the grid in. Values such as gridSize, cellSize, and gridOrgin can all be put into an interface down the line, for now, I am defining them as variables in create(). The actual grid is created by calling createGrid(). Update responds to keyboard input and interacts with the Player class to manipulate its movement accordingly.
- I defined the class Player in Player.js which handles all logic for the player. The main part of this class is the move() and updatePosition() methods. The move function is designed to update the logical position of the player on the grid adding the change in x & y (deltaX & deltaY) to the player's current position. The method updatePositon is designed to update the visual position of the player.

### F0.b - Kaylee
- I implemented the manual time advancement in the GameScene.js.
- In GameScene.js, I created a button that when clicked, advances the game time. This is essential for simulating turn-based mechanics where players can strategize and plan their moves according to the game time.
- In GameScene.js, I integrated a manual time control mechanism essential for our turn-based simulation. This feature allows players to advance the in-game time manually using a dedicated button, strategically influencing the game's state based on their decisions.
- I added a visual indicator on the screen to show the current game time, updating it each time the player uses the button to advance time.

### F0.c - Samina
- I implemented the ability for the player to reap and sow plants on grid cells in the GameScene.js.
- In GameScene.js, I added keyboard controls (R key for reaping and S key for sowing) that allow players to interact with nearby grid cells to manage plants.
- The player can only reap or sow plants when standing on the corresponding grid cell, ensuring close proximity for these actions.
- Added visual indicators that change the color of a grid cell based on whether a plant is sown or reaped, providing feedback on the plant's status.
- Added a visual sprite for the plant that is a visual representation of the plant on the grid when sown.

### F0.d - Group
- We added sun and water levels to each grid cell in GameScene.js to simulate environmental conditions.
- In GameScene.js, we created a function to update sun and water levels for each grid cell when the game time advances.
- Sun energy is generated randomly each turn and is used immediately or lost, making sure it doesn’t carry over to the next turn.
- Water, on the other hand, accumulates gradually over multiple turns, which allows cells to build up moisture over time.
- We also set a maximum cap for water accumulation to keep the resource levels balanced within the game.

### F0.e - Hasina
- I introduced distinct plant types and growth levels into the game. Each plant on the grid now has a type (e.g., one of three species) and a growth level that progresses over time.
- When sowing a plant, it is assigned a random type (from a predefined set of three) and starts with growth level 1. This adds diversity to the gameplay and differentiates how plants behave and evolve.
- Growth levels are advanced based on the sun and water availability in the grid cell when the game time advances. The maximum growth level is capped at 3.
- I updated the reap functionality to log the type and growth level of each plant, providing better player feedback on their actions.
Growth levels for each plant visually evolve based on sun and water resources, emphasizing the importance of environmental management by the player.

### F0.f - Celeste
- I added growth conditions for the different plant types. They are based on the sun and water levels of the grid it is planted on, and how many of the same plant types are near them.
- I updated the plant sprites to reflect the growth level and plant type so players can visualize the growth process.
- I also adjusted sun levels to give the grids a larger range of possible values since sun levels aren't stored. Additionally, this gives more variety for growth conditions for the different plant types
- Finally, I updated the water values to reset after a plant has been reaped, that way the player starts with fresh soil when replanting.

### F0.g - Samina
- I added a condition to complete the play scenario when enough plants reach a certain growth level in GameScene.js.
- I also implemented a check that tracks if the play scenario is completed, ensuring it only triggers once to avoid loops.


### Reflection

Looking back on how we achieved the F0 requirements, our team's plan changed a lot in several ways:

1. **Tools and Technologies**:
We started with Phaser and thought our JavaScript skills would be enough. But we quickly realized that integrating everything needed better collaboration tools. We used VS Code for coding, GitHub for version control and reviews, and Discord for regular meetings and discussions. These tools helped us manage updates from multiple team members without conflicts. Kaylee was crucial in setting up these tools and guiding everyone on how to use them effectively.

2. **Changing Team Roles**:
At first, we had specific roles like Tools Lead, Engine Lead, and Design Lead. As the project progressed, we found that our roles often overlapped, so we became more flexible:
- We started doing pair programming and had more group discussions, especially for complex features like plant growth logic and time advancement.
- **Role Adjustments**: For example, Celeste and Hasina worked together on plant growth and visuals, while Samina and Shea worked on reaping and sowing actions for the player.

3. **Refactoring and Iterative Development**:
Initially, we focused on getting the core features done quickly. As we moved forward, we realized the need for refactoring to keep the code clean and organized. We followed DRY principles to avoid repeated code and created utility functions. Kaylee also helped set up coding guidelines to make refactoring smoother. We worked in iterations: starting with something simple, testing it, and then improving. For example, we consolidated scattered sun and water updates into reusable methods.

4. **Simplifying the Growth Mechanism**:
Our original idea for plant growth was too complicated, with too many types of plants and conditions. It became overwhelming, so we simplified it:
- We reduced the plant types to three and kept the growth logic consistent for all, with minor variations based on sun and water. This made it easier to manage while keeping some variety.

5. **Scenario Completion Goals**:
We initially wanted multiple ways to complete the game, but it made coding and testing difficult. We simplified it to one condition: having enough plants reach a specific growth level. This made it easier to meet the F0 requirements and gave players a clear objective.

6. **Addressing Code Duplication**:
We noticed a lot of repetitive code, especially for managing plant types and growth. We refactored this into utility functions to make the code cleaner. For example, checking nearby plant count for growth was repeated, so we made it a utility function. We also refactored functions for updating resource levels in grid cells.

7. **Embracing Iterative Planning**:
At first, we tried to complete each feature entirely before moving on to the next. We learned that it was better to work on small, testable parts, then review and improve them before continuing. This made the code easier to manage and helped us address issues without dealing with large, complex chunks of work.

### Key Takeaways
- We used collaboration tools like VS Code, GitHub, and Discord to keep our development process smooth.
- Pair programming and flexible roles helped us solve problems faster and share knowledge across the team.
- We scaled back our original ambitions for plant types and game conditions to focus on a playable version that met the F0 requirements.
- Refactoring and DRY principles kept our code cleaner and easier to maintain.

Overall, we shifted our approach to focus on simplicity, collaboration, and iteration. This helped us meet the F0 requirements effectively and build a strong foundation for future improvements.

## F1 Documentation

### F0 No changes since the last assignment. All requirements are met for F0. 

### F1.a - Everyone
- We made sure the game's grid state is stored in a single contiguous byte array.
- We changed our grid state to use a byte array as the main format.
- We chose an AoS format and each cell's data (water levels, sun levels, cell type, and plant growth) is stored one after another in the array.
- We added functions to convert the byte array into a readable format when needed, like for gameplay logic or rendering.

Memory allocation strategy illustration: 
![bytearray](https://github.com/user-attachments/assets/100a548f-265a-4f67-b830-03adab776e40)

### F1.b - Kaylee
- I made a saveGame function to save the game, player position, and plant data.
- I made a loadGame function to get back all of the saved data after the player activates the saveGame function.
- I made sure that the sprites and growth levels did not get overwritten with an updateGridVisuals function.

### F1.c - Hasina and Samina
- Added thick blue outlines for UI elements that players should interact with.
- Implemented mouseover effects to highlight interactive elements.
- Displayed instructional messages to guide players on their objectives.

### F1.d - Shea
- Refactored some of the saving logic into functions so it can be re-usable for undo/redo
- added undo and redo stacks
- when a major move is made (sowing, reaping, advancing time) that game state is pushed to the undo stack
- when ctrl + z is pressed the most recent state in undo stack is popped out and loaded
- the state that was undone is pushed into the redo stack
- when ctrl + y is pressed the most recent state in the redo stack is popped out and loaded


### Reflection
Looking back on how we achieved the F1 requirements, our team made several adjustments:

1. **Player Feedback and Visual Cues**:
   Initially, our plan didn't include much real-time feedback for the player. To meet the F1 requirements, we added visual indicators for when a plant needed more sunlight or water—using icons above plants to signal their needs. This made it easier for players to understand actions and feel more in control.

2. **Tools and Technologies**:
   We underestimated the complexity of implementing feedback. To address this, we added new libraries for animations and UI feedback.

3. **Evolution of Team Roles**:
   Initially, we had rigid roles, but adding feedback mechanisms required more collaboration. Hasina worked with Samina to ensure visual cues matched player actions, and more group discussions fostered cross-role flexibility.

4. **Iterative User Testing**:
   We shifted to more iterative user testing by inviting friends and classmates to try the game. Their feedback led us to increase the visibility of indicators. Continuous testing became a core part of our development.

5. **Simplified Feedback Mechanisms**:
   We initially planned complex metrics for plant health but simplified it to just two needs: water and sunlight. This reduced complexity made the game more approachable.

6. **Refactoring for Feedback Integration**:
   Integrating feedback required refactoring plant growth logic. Shea and Kaylee worked on creating efficient event listeners to ensure smooth interactions.

### Key Takeaways
- **Enhanced Player Feedback**: Adding visual cues improved user experience and helped players understand the game better.
- **Flexible Roles and Collaboration**: Adding feedback pushed us to work more collaboratively across roles.
- **Iterative Testing**: Frequent user testing allowed us to adapt our design based on real experiences.
- **Simplified Complexity**: Reducing plant health indicators made the game more approachable and enjoyable.

Adapting to the F1 requirements helped us build a more player-centric game, emphasizing user experience and feedback. It taught us the value of flexibility in both team roles and game design.

## F2 Documentation

### F0+F1 No major changes were made in for F0 and F1, so the F0 and F1 requirements are still met in F2. 

### F2.a - Everyone
- Created scenarios.dsl file as a draft of what design we wanted the scenarios to look like.
- Created json files that depicted different scenarios for the game. There is a tutorial scenario and a challenge scenario.
- Imported the scenarios into the gameScene.js file. Along with that, we implemented the code by creating functions inside of the scenarioManager class. These functions include handTimeBasedEvents, loadScenario, applyingStartingConditions, handleScheduledEvents, checkVictoryConditions, and loadNextScenario.
- Updated our previous code to work with the loading and saving within different scenarios (ex. recreating the grid of a scenario).
#### Scenario Design:
```json
{
  "scenarioName": "Tutorial",
  "startConditions": {
    "gridSize": 3,
    "playerPosition": [1, 1],
    "plants": [
      { "position": [0, 0], "type": 1, "growth": 1 },
      { "position": [2, 2], "type": 2, "growth": 2 }
    ]
  },
  "weather": {
    "sunRange": [0, 6],
    "waterRange": [0, 2]
  },
  "events": [
    { "time": 5, "action": "addPlant", "details": { "position": [1, 1], "type": 3 } },
    { "time": 10, "action": "increaseWater", "details": { "amount": 2 } }
  ],
  "victoryConditions": [
    {
      "type": "plantGrowth",
      "details": {
        "position": [1, 1],
        "growthLevel": 3
      }
    },
    {
      "type": "totalPlants",
      "details": {
        "minCount": 3
      }
    }
  ],
  "nextScenario": "challenge"
}
```

### F2.b - Everyone 
- Created a PlantType class, which dealt with the growing conditions and the special abilities.
- Created the new plant types in a const condition.
- Created new functions for our plant type index (ex. addPlantType, removePlantType) 
- Updated our previous code to work with these plant types (ex. sowPlant, plantGrowth)
```javascript
class PlantType {
  constructor(name, growthConditions, specialAbility, frameIndices) {
    this.name = name;
    this.growthConditions = growthConditions;
    this.specialAbility = specialAbility;
    this.frameIndices = frameIndices;
  }

  canGrow(x, y, gridState, gameTime) {
    return this.growthConditions(x, y, gridState, gameTime);
  }

  applySpecialAbility(x, y, gridState) {
    if (this.specialAbility) {
      this.specialAbility(x, y, gridState);
    }
  }

  grow(x, y, gridState, gameTime) {
    const currentGrowthLevel = gridState.getGrowthLevel(x, y);
    if (currentGrowthLevel < 5 && this.canGrow(x, y, gridState, gameTime)) {
      const newGrowthLevel = currentGrowthLevel + 1;
      gridState.setGrowthLevel(x, y, newGrowthLevel);
      this.applySpecialAbility(x, y, gridState);
      return newGrowthLevel;
    }
    return currentGrowthLevel;
  }
}

const plantTypes = [
  new PlantType(
    "Sun Lover",
    (x, y, gridState, gameTime) =>
      gridState.getSunLevel(x, y) > 3 &&
      gridState.getWaterLevel(x, y) < 3 &&
      gameTime % 2 === 0,
    (x, y, gridState) => {
      // Special ability: Increase sun level in adjacent cells
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      neighbors.forEach(([nx, ny]) => {
        if (
          nx >= 0 &&
          nx < gridState.gridSize &&
          ny >= 0 &&
          ny < gridState.gridSize
        ) {
          const currentSun = gridState.getSunLevel(nx, ny);
          gridState.setSunLevel(nx, ny, Math.min(10, currentSun + 1));
        }
      });
    },
    [14, 16, 17, 18, 19] // carrot
  ),
  new PlantType(
    "Water Lover",
    (x, y, gridState, gameTime) =>
      gridState.getWaterLevel(x, y) > 3 &&
      gridState.getSunLevel(x, y) < 3 &&
      gameTime % 3 === 0,
    (x, y, gridState) => {
      // Special ability: Increase water level in adjacent cells
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      neighbors.forEach(([nx, ny]) => {
        if (
          nx >= 0 &&
          nx < gridState.gridSize &&
          ny >= 0 &&
          ny < gridState.gridSize
        ) {
          const currentWater = gridState.getWaterLevel(nx, ny);
          gridState.setWaterLevel(nx, ny, Math.min(10, currentWater + 1));
        }
      });
    },
    [21, 23, 24, 25, 26] // cabbage
  ),
  new PlantType(
    "Balanced",
    (x, y, gridState) =>
      Math.abs(gridState.getSunLevel(x, y) - gridState.getWaterLevel(x, y)) <=
      1,
    (x, y, gridState) => {
      // Special ability: Balance sun and water levels in current cell
      const sunLevel = gridState.getSunLevel(x, y);
      const waterLevel = gridState.getWaterLevel(x, y);
      const average = Math.round((sunLevel + waterLevel) / 2);
      gridState.setSunLevel(x, y, average);
      gridState.setWaterLevel(x, y, average);
    },
    [28, 30, 31, 32, 33] // plum
  ),
  new PlantType(
    "Neighbor Dependent",
    (x, y, gridState) => {
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ].filter(
        ([nx, ny]) =>
          nx >= 0 &&
          nx < gridState.gridSize &&
          ny >= 0 &&
          ny < gridState.gridSize
      );
      return neighbors.some(([nx, ny]) => gridState.getPlantType(nx, ny) !== 0);
    },
    (x, y, gridState) => {
      // Special ability: Boost growth of neighboring plants
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      neighbors.forEach(([nx, ny]) => {
        if (
          nx >= 0 &&
          nx < gridState.gridSize &&
          ny >= 0 &&
          ny < gridState.gridSize
        ) {
          const currentGrowth = gridState.getGrowthLevel(nx, ny);
          if (currentGrowth > 0 && currentGrowth < 5) {
            gridState.setGrowthLevel(nx, ny, currentGrowth + 1);
          }
        }
      });
    },
    [35, 37, 38, 39, 40] // eggplant
  ),
];
```

### F2.c - Everyone
- **Objective:** Adapted the project from JavaScript to TypeScript to enhance type safety and maintainability.  
- Converted core modules (ex., `GameScene.js`) from JavaScript to TypeScript.
- Used Vite as the build tool for faster development and seamless integration with TypeScript.
- Used Brace to assist with translating JavaScript code to TypeScript syntax.  
- Tested the TypeScript version to ensure full compatibility with the original JavaScript implementation.

### Reflection
Looking back on how we achieved the F2 requirements, our team made several adjustments:

1. **Switch to TypeScript and Vite**:  
   Initially, we planned to stick with JavaScript, but transitioning to TypeScript provided type safety and better scalability. Vite was introduced as our build tool to speed up development and simplify the integration process.

2. **Revised Tools and Libraries**:  
   Moving to TypeScript required re-evaluating our libraries and tools. Some libraries used in JavaScript needed TypeScript-compatible alternatives, which altered our initial setup.

3. **Evolution of Team Roles**:  
   The transition to TypeScript required more collaboration across roles. We worked together to refactor code with type annotations and interfaces. This blurred the lines between frontend and backend roles, fostering a more dynamic workflow.

4. **Improved Modularity for Feedback**:  
   Thinking about player feedback during the adaptation process led us to refactor our code for better modularity. For example, functions like `plantGrowth` and `sowPlant` were enhanced to provide clearer feedback through TypeScript interfaces.

5. **Iterative Testing for TypeScript**:  
   We underestimated the learning curve for TypeScript syntax and debugging. Regular testing helped us identify and resolve type-related issues early, ensuring compatibility with the JavaScript implementation.

6. **Simplified Transition Plan**:  
   Initially, we aimed to rewrite entire modules in one go, but we pivoted to a phased approach. This allowed us to maintain a working game while gradually integrating TypeScript.

### Key Takeaways
- **TypeScript Benefits**: The switch improved code maintainability and reduced runtime errors, making the project more robust.
- **Tool Flexibility**: Adopting Vite and TypeScript-compatible libraries streamlined development.
- **Collaboration Growth**: The transition fostered better teamwork, with team members supporting each other during the learning process.
- **Iterative Progress**: A phased transition helped us adapt without disrupting the game’s functionality.

Adapting to the F2 requirements taught us the importance of flexibility and collaboration when integrating new technologies, ultimately enhancing the project's structure and maintainability.


## F3 Documentation
### F0+F1+F2 No major changes were made in for F0, F1, and F2, so the requirements are still met in F3. 

### F3.a - Everyone
- We ensured that all text visible to the player can be translated into different written languages.
- We avoided hard-coding any English text into the game, allowing for future localization into various languages.
- We designed UI elements to be flexible, ensuring they can accommodate text expansion or contraction when different languages are selected.

### F3.b - Everyone
- We localized the game to support three different written languages.
  -  One language was chosen that uses a logographic script (Chinese).
  -  One language was chosen that uses a right-to-left script (Arabic).
  -  The third language is a common left-to-right script (Spanish).
- All in-game text has been fully localized, ensuring proper support for the different scripts.

### F3.c - Everyone
- Unable to complete due to time constraints.

### F3.d - Everyone
- Unable to complete due to time constraints. 

Feel free to adapt this file as we change our objectives!
