var sections = document.querySelectorAll(".section");
var nextButton = document.getElementById("nextButton");
var prevButton = document.getElementById("prevButton");
var currentSection = 0;

function openDoors() {
    document.querySelectorAll(".door").forEach((door) => {
        door.classList.add("open");
    });
}


function createSectionsController(linesMesh, delaysMesh, optionsLines, delaysData, stopsMesh, stopsData) {
    function updateSections(linesMesh, delaysMesh) {
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
                showButton(nextButton);
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
                hideButton(nextButton);
                showStops(stopsMesh);
                updateHeatmap(stopsData);
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

    openDoors();
}

function showButton(element) {
    element.disabled = false;
}

function hideButton(element) {
    element.disabled = true;
}