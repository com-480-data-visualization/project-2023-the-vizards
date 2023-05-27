var sections = document.querySelectorAll(".section");
var nextButton = document.getElementById("nextButton");
var prevButton = document.getElementById("prevButton");
var currentSection = 0;

function createSectionsController(linesMesh, delaysMesh, optionsLines) {
    function openDoors() {
        var leftDoor = new Image();
        leftDoor.src = "/../../images/left_door.png";
      
        var rightDoor = new Image();
        rightDoor.src = "/../../images/right_door.png";
      
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");
      
        var centerX = canvas.width / 2;
        var doorWidth = leftDoor.width;
        var doorHeight = leftDoor.height;
      
        var doorOpenIncrement = 1; // Increase this value to make the doors open faster
      
        var leftDoorX = centerX - doorWidth;
        var rightDoorX = centerX;
      
        var interval = setInterval(function () {
          context.clearRect(0, 0, canvas.width, canvas.height);
      
          // Draw the left door
          context.drawImage(leftDoor, leftDoorX, (canvas.height - doorHeight) / 2, doorWidth, doorHeight);
      
          // Draw the right door
          context.drawImage(rightDoor, rightDoorX, (canvas.height - doorHeight) / 2, doorWidth, doorHeight);
      
          // Adjust the door positions for opening effect
          leftDoorX -= doorOpenIncrement;
          rightDoorX += doorOpenIncrement;
      
          if (leftDoorX + doorWidth < centerX && rightDoorX > centerX) {
            clearInterval(interval);
            console.log("Doors opened!");
          }
        }, 100); // Adjust the interval (in milliseconds) to control the animation speed
    }
      
    function updateSections(linesMesh, delaysMesh) {
        switch (currentSection) {
            case 0:
                showAllLines(linesMesh);
                hideAllDelay(delaysMesh);
                centerGlobal();
                showSection(0)
                hideButton(prevButton);
                break;
            case 1:
                hideAllLines(linesMesh);
                handleHighlight(linesMesh, undefined);
                unhighlightChampionship(optionsLines)
                updateVisibilityLine(linesMesh, delaysMesh);
                showSection(1)
                showButton(prevButton);
                break;
            case 2:
                showAllLines(linesMesh);
                hideAllDelay(delaysMesh);
                centerGlobal();
                showSection(2)
                showButton(nextButton);
                break;
            case 3:
                centerGlobal();
                handleHighlight(linesMesh, undefined);
                unhighlightChampionship(optionsLines)
                showSection(3)
                hideButton(nextButton);
                break;
            default:
                break;
        }
    }

    function showSection(id) {
        var sections = document.querySelectorAll(".section");

        sections.forEach((section, index) => {
            if (index === id) {
                activateSection(section);
                section.classList.add("active");
            } else {
                deactivateSection(section);
                section.classList.remove("active");
            }
        });
    }

    // Function to deactivate a section
    function deactivateSection(section) {
        // First fade out the section
        section.style.opacity = '0';

        // Then, after the transition is complete, set display to 'none'
        setTimeout(function () {
            section.style.display = 'none';
        }, 500);  // The timeout should match the transition duration
    }

    // Function to activate a section
    function activateSection(section) {
        // We use setTimeout to ensure that the change in display is finished before we start the fade in
        setTimeout(function () {
            section.style.opacity = '1';
            section.style.display = 'block';
        }, 500);
    }

    nextButton.addEventListener("click", function () {
        if (currentSection === sections.length - 1) return;
        currentSection = currentSection + 1;
        updateSections(linesMesh, delaysMesh);
    });

    prevButton.addEventListener("click", function () {
        if (currentSection === 0) return;
        currentSection = currentSection - 1;
        updateSections(linesMesh, delaysMesh);
    });

    updateSections(linesMesh, delaysMesh);
}

function showButton(element) {
    element.disabled  = false;
}

function hideButton(element) {
    element.disabled  = true;
}