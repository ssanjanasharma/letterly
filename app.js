const recipientInput =
    document.getElementById("recipientName");

const letterInput =
    document.getElementById("letterText");

const futureInput =
    document.getElementById("futureText");

const previewRecipient =
    document.getElementById("previewRecipient");

const previewMessage =
    document.getElementById("previewMessage");

function initAutoResize(textarea) {
    if (!textarea) return;
    const adjustHeight = () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    };
    textarea.addEventListener("input", adjustHeight);
    // Initialize height
    adjustHeight();
    // Run again when page resources finish loading to get correct initial heights
    window.addEventListener("load", adjustHeight);
}

initAutoResize(letterInput);
initAutoResize(futureInput);



recipientInput?.addEventListener("input", () => {
    if (previewRecipient) {
        previewRecipient.innerText =
            `Dear ${recipientInput.value || "Someone"} ♡`;
    }
});



letterInput?.addEventListener("input", () => {
    if (previewMessage) {
        previewMessage.innerText =
            letterInput.value ||
            "Your letter preview appears here...";
    }
});



const stickerItems =
    document.querySelectorAll(".sticker-item");

const paper =
    document.querySelector(".love-letter-canvas") || document.querySelector(".future-letter");



stickerItems.forEach(sticker => {

    sticker.addEventListener("click", () => {

        const wrapper = document.createElement("div");
        wrapper.classList.add("draggable-sticker-wrapper");

        // Spawn sticker at a random position within the letter boundaries
        const paperWidth = paper.offsetWidth;
        const paperHeight = paper.offsetHeight;

        // Keep 10px margin from edges, assuming max initial size is around 120px including padding
        const maxLeft = Math.max(10, paperWidth - 130);
        const maxTop = Math.max(10, paperHeight - 130);

        const spawnLeft = Math.max(10, Math.random() * maxLeft);
        const spawnTop = Math.max(10, Math.random() * maxTop);

        wrapper.style.left = spawnLeft + "px";
        wrapper.style.top = spawnTop + "px";
        wrapper.style.width = "100px";

        const newSticker = document.createElement("img");
        newSticker.src = sticker.src;
        newSticker.classList.add("draggable-sticker");
        wrapper.appendChild(newSticker);

        const closeBtn = document.createElement("button");
        closeBtn.classList.add("sticker-close-btn");
        closeBtn.innerHTML = "×";
        closeBtn.title = "Remove sticker";
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            wrapper.remove();
        });
        wrapper.appendChild(closeBtn);

        paper.appendChild(wrapper);

        makeDraggable(wrapper);

    });

});



function limitDrag(left, top, element, paper) {
    const minLeft = 0;
    const minTop = 0;
    const maxLeft = Math.max(0, paper.offsetWidth - element.offsetWidth);
    const maxTop = Math.max(0, paper.offsetHeight - element.offsetHeight);
    return {
        left: Math.max(minLeft, Math.min(maxLeft, left)),
        top: Math.max(minTop, Math.min(maxTop, top))
    };
}



function makeDraggable(element) {

    let isDragging = false;

    let offsetX = 0;
    let offsetY = 0;

    // Mouse events
    element.addEventListener(
        "mousedown",
        (e) => {
            if (e.target.classList.contains("sticker-close-btn")) return;
            isDragging = true;

            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            element.style.cursor = "grabbing";
        }
    );

    document.addEventListener(
        "mousemove",
        (e) => {

            if (!isDragging)
                return;

            const paperRect = paper.getBoundingClientRect();
            const rawLeft = e.clientX - paperRect.left - offsetX;
            const rawTop = e.clientY - paperRect.top - offsetY;

            const constrained = limitDrag(rawLeft, rawTop, element, paper);
            element.style.left = constrained.left + "px";
            element.style.top = constrained.top + "px";

        }
    );

    document.addEventListener(
        "mouseup",
        () => {
            isDragging = false;
            element.style.cursor = "grab";
        }
    );

    // Touch events for mobile/tablet dragging
    element.addEventListener(
        "touchstart",
        (e) => {
            if (e.target.classList.contains("sticker-close-btn")) return;
            isDragging = true;

            const touch = e.touches[0];
            const rect = element.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
        },
        { passive: true }
    );

    document.addEventListener(
        "touchmove",
        (e) => {

            if (!isDragging)
                return;

            const touch = e.touches[0];
            e.preventDefault(); // Stop mobile viewport scrolling while dragging

            const paperRect = paper.getBoundingClientRect();
            const rawLeft = touch.clientX - paperRect.left - offsetX;
            const rawTop = touch.clientY - paperRect.top - offsetY;

            const constrained = limitDrag(rawLeft, rawTop, element, paper);
            element.style.left = constrained.left + "px";
            element.style.top = constrained.top + "px";

        },
        { passive: false }
    );

    document.addEventListener(
        "touchend",
        () => {
            isDragging = false;
        }
    );

    // Mouse wheel scaling
    element.addEventListener(
        "wheel",
        (e) => {

            e.preventDefault();

            // Use element style width directly to avoid box-model padding/border offset issues
            let size =
                parseFloat(element.style.width) || 100;

            if (e.deltaY < 0) {

                size += 10;

            } else {

                size -= 10;

            }

            size = Math.max(50, size);
            size = Math.min(paper.offsetWidth - 20, size);

            element.style.width =
                size + "px";

            // Immediately enforce constraints after resizing
            const currentLeft = parseFloat(element.style.left) || 0;
            const currentTop = parseFloat(element.style.top) || 0;
            const constrained = limitDrag(currentLeft, currentTop, element, paper);
            element.style.left = constrained.left + "px";
            element.style.top = constrained.top + "px";

        }
    );

}



const createLetterBtn =
    document.getElementById(
        "createLetterBtn"
    );

const copyBtn =
    document.getElementById(
        "copyBtn"
    );



createLetterBtn?.addEventListener(
    "click",
    () => {

        const sender =
            document.getElementById(
                "senderName"
            ).value;

        const recipient =
            recipientInput.value;

        const letter =
            letterInput.value;

        if (
            !sender ||
            !recipient ||
            !letter
        ) {

            alert(
                "Please fill all fields."
            );

            return;
        }

        const id =
            Math.random()
                .toString(36)
                .substring(2, 10);

        // Gather all placed stickers from the canvas wrapper elements
        const stickers = [];
        const stickerElements = paper.querySelectorAll(".draggable-sticker-wrapper");
        stickerElements.forEach(el => {
            const img = el.querySelector(".draggable-sticker");
            if (img) {
                stickers.push({
                    src: img.getAttribute("src"),
                    x: parseFloat(el.style.left) || 0,
                    y: parseFloat(el.style.top) || 0,
                    width: el.style.width || "100px"
                });
            }
        });

        // Save letter and decoration details to localStorage
        localStorage.setItem(
            `love-letter-${id}`,
            JSON.stringify({
                sender,
                recipient,
                message: letter,
                stickers,
                date: document.getElementById('letterDate')?.textContent || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            })
        );

        // Generate robust link pointing to view-letter.html
        const link =
            window.location.href.replace("loved-one.html", `view-letter.html?id=${id}`);

        document.getElementById(
            "generatedLink"
        ).value = link;

        document.getElementById(
            "linkBox"
        ).style.display = "flex";

    }
);



copyBtn?.addEventListener(
    "click",
    () => {

        navigator.clipboard.writeText(
            document.getElementById(
                "generatedLink"
            ).value
        );

        copyBtn.innerText =
            "Copied 🤍";

    }
);