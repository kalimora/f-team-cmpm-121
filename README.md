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

## Documentation
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
- Finall,y I updated the water values to reset after a plant has been reaped, that way the player starts with fresh soil when replanting.

## F0.g - Samina
- 

Feel free to adapt this file as we change our objectives!
