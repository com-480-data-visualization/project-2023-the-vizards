var sections = document.querySelectorAll(".section");
var nextButton = document.getElementById("nextButton");
var prevButton = document.getElementById("prevButton");
var currentSection = 0;

function openDoors() {
    // Function to open the doors by adding the "open" class to all elements with the class "door"
    document.querySelectorAll(".door").forEach((door) => {
        door.classList.add("open");
    });
}


function createSectionsController(linesMesh, delaysMesh, optionsLines, delaysData, stopsMesh, stopsData) {
     // Function to create a controller for managing different sections of the application
    function updateSections() {
        switch (currentSection) {
            case 0:
                showAllLines(linesMesh);
                hideAllDelay(delaysMesh);
                handleHighlight(linesMesh, undefined);
                unhighlightChampionship(optionsLines)
                centerGlobal();
                showSection(0)
                hideButton(prevButton);
                break;
            case 1:
                removeLinePlot();
                hideAllLines(linesMesh);
                showAllLines(linesMesh);
                hideAllDelay(delaysMesh);
                centerGlobal();
                showSection(1)
                showButton(prevButton);
                break;
            case 2:
                hideAllLines(linesMesh);
                handleHighlight(linesMesh, undefined);
                unhighlightChampionship(optionsLines)
                updateVisibilityLine(linesMesh, delaysMesh);
                plotLineDelays(delaysData, optionsLines)
                showSection(2)
                hideAllStops(stopsMesh);
                hideHeatmap()
                break;
            case 3:
                removeLinePlot();
                hideAllLines(linesMesh);
                showAllLines(linesMesh);
                hideAllDelay(delaysMesh);
                centerGlobal();
                handleHighlight(linesMesh, undefined);
                unhighlightChampionship(optionsLines)
                showSection(3)
                showStops(stopsMesh);
                updateHeatmap(stopsData);
                break;
            case 4:
                showSection(4)
                hideAllLines(linesMesh);
                centerEPFL();
                hideAllStops(stopsMesh);
                hideHeatmap()
                showButton(nextButton);
                break;

            case 5:
                showSection(5)
                centerEPFL();
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


    function nextSection() {
        if (currentSection === sections.length - 1) return;
        currentSection = currentSection + 1;
        updateSections(linesMesh, delaysMesh);
    }

    function prevSection() {
        if (currentSection === 0) return;
        currentSection = currentSection - 1;
        updateSections(linesMesh, delaysMesh);
    }

    nextButton.addEventListener("click", nextSection);
    prevButton.addEventListener("click", prevSection);

    document.addEventListener('keydown', function (e) {
        console.log(e)
        switch (e.key) {
            case "ArrowLeft":
                prevSection();
                break;
            case "ArrowRight":
                nextSection();
                break;
        }
    });

    function showButton(element) {
        element.disabled = false;
    }
    
    function hideButton(element) {
        element.disabled = true;
    }

    updateSections(linesMesh, delaysMesh);

    
}

/**
 * Function to update the progress bar and text.
 * @param {number} step - Current step in the progress.
 */
function updateProgress(step) {
    var progressImages = ["static/images/animation/man_1.png", "static/images/animation/man_2.png", "static/images/animation/man_2.png", "static/images/animation/man_3.png"];
    var progressTexts = ["Loading lines...", "Loading delays...", "Loading championship...", "Loading stops..."];

    var progress = document.getElementById('start-progress');
    var progressImg = document.getElementById('start-progress-img');
    var progressText = document.getElementById('start-progress-text');

    var width = (step / progressTexts.length) * 100;
    progress.style.width = width + '%';

    progressImg.src = progressImages[step - 1]; // Update the image
    progressText.textContent = progressTexts[step - 1]; // Update the text

    if (width  == 100) {
        document.getElementById('start-progress-container').classList.add('hidden')
        setTimeout(function () {
            document.getElementById('start-progress-container').style.display = 'none';
        }, 2000)

        setTimeout(function () {
            openDoors();
        }, 1200)
    }
}
