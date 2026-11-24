
/* ========================================
   CLUBCONNECT - JAVASCRIPT
   LPU DESIGN THINKING PROJECT
======================================== */


/* ========================================
   1. DEFAULT DATA
======================================== */

const defaultMembers = [
    {
        id: 1,
        name: "Aarav Sharma",
        role: "Club Lead",
        email: "",
        status: "Active"
    },
    {
        id: 2,
        name: "Meera Kapoor",
        role: "Event Team",
        email: "",
        status: "Active"
    },
    {
        id: 3,
        name: "Rohan Verma",
        role: "Design Team",
        email: "",
        status: "Active"
    },
    {
        id: 4,
        name: "Sana Khan",
        role: "Content Team",
        email: "",
        status: "Active"
    },
    {
        id: 5,
        name: "Ishita Singh",
        role: "Event Team",
        email: "",
        status: "Needs check-in"
    }
];


const defaultTasks = [
    {
        id: 101,
        title: "Prepare event poster",
        assignee: "Rohan Verma",
        due: "",
        status: "In Progress"
    },
    {
        id: 102,
        title: "Draft welcome message",
        assignee: "Meera Kapoor",
        due: "",
        status: "Pending"
    },
    {
        id: 103,
        title: "Confirm venue checklist",
        assignee: "Aarav Sharma",
        due: "",
        status: "Pending"
    }
];


/* ========================================
   2. LOAD DATA FROM LOCAL STORAGE
======================================== */

function loadData(key, defaultValue) {

    try {

        const savedData = localStorage.getItem(key);

        if (savedData === null) {
            return defaultValue;
        }

        return JSON.parse(savedData);

    } catch (error) {

        console.error("Data loading error:", error);

        return defaultValue;
    }
}


let members = loadData("cc_members", defaultMembers);
let tasks = loadData("cc_tasks", defaultTasks);
let feedback = loadData("cc_feedback", []);
let joiners = loadData("cc_joiners", []);


/* ========================================
   3. SAVE DATA
======================================== */

function saveData() {

    localStorage.setItem("cc_members", JSON.stringify(members));

    localStorage.setItem("cc_tasks", JSON.stringify(tasks));

    localStorage.setItem("cc_feedback", JSON.stringify(feedback));

    localStorage.setItem("cc_joiners", JSON.stringify(joiners));
}


/* ========================================
   4. NOTIFICATION
======================================== */

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.style.display = "block";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        toast.style.display = "none";

    }, 2500);
}


/* ========================================
   5. HTML SAFETY HELPER
======================================== */

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function(character) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];

    });
}


/* ========================================
   6. INITIALS
======================================== */

function getInitials(name) {

    return String(name || "?")
        .trim()
        .split(/\s+/)
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}


/* ========================================
   7. PAGE NAVIGATION
======================================== */

function goToPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {

        page.classList.remove("active");

    });

    const selectedPage = document.getElementById(pageName);

    if (!selectedPage) {
        return;
    }

    selectedPage.classList.add("active");


    document.querySelectorAll(".nav-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );

    });


    const pageTitles = {
        dashboard: "Dashboard",
        members: "Members",
        tasks: "Tasks",
        onboarding: "New Members",
        feedback: "Feedback"
    };

    document.getElementById("pageTitle").textContent =
        pageTitles[pageName] || pageName;

    renderAll();
}


document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", function() {

        goToPage(button.dataset.page);

    });

});


/* ========================================
   8. TASK STATUS BADGE
======================================== */

function createBadge(status) {

    let cssClass = "pending";

    if (status === "In Progress") {
        cssClass = "progress";
    }

    if (status === "Completed") {
        cssClass = "completed";
    }

    return `
        <span class="badge ${cssClass}">
            ${escapeHTML(status)}
        </span>
    `;
}


/* ========================================
   9. MEMBER HTML
======================================== */

function memberHTML(member) {

    const statusClass =
        member.status === "Active" ? "" : "inactive";

    return `
        <div class="member-row">

            <div class="avatar">
                ${escapeHTML(getInitials(member.name))}
            </div>

            <div class="member-info">

                <strong>${escapeHTML(member.name)}</strong>

                <small>
                    ${escapeHTML(member.role)}
                    ${member.email ? " · " + escapeHTML(member.email) : ""}
                </small>

            </div>

            <span class="member-status ${statusClass}">
                ${escapeHTML(member.status)}
            </span>

            <div class="button-group">

                <button class="secondary-button"
                    onclick="openMemberForm(${member.id})">
                    Edit
                </button>

                <button class="danger-button"
                    onclick="deleteMember(${member.id})">
                    Remove
                </button>

            </div>

        </div>
    `;
}


/* ========================================
   10. RENDER DASHBOARD
======================================== */

function renderDashboard() {

    // Statistics

    document.getElementById("totalMembers").textContent =
        members.length;

    document.getElementById("activeMembers").textContent =
        members.filter(member => member.status === "Active").length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(task => task.status !== "Completed").length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(task => task.status === "Completed").length;


    // Recent Tasks

    const dashboardTasks = document.getElementById("dashboardTasks");

    dashboardTasks.innerHTML = tasks.slice(0, 5).map(task => {

        return `
            <div class="task-row">

                <div class="task-info">
                    <strong>${escapeHTML(task.title)}</strong>

                    <small>
                        ${escapeHTML(task.assignee || "Unassigned")}
                        · Due ${escapeHTML(task.due || "Not set")}
                    </small>
                </div>

                ${createBadge(task.status)}

            </div>
        `;

    }).join("") || `<div class="empty">No tasks available.</div>`;


    // Dashboard Members

    const dashboardMembers =
        document.getElementById("dashboardMembers");

    dashboardMembers.innerHTML = members
        .slice(0, 5)
        .map(memberHTML)
        .join("") || `<div class="empty">No members available.</div>`;
}


/* ========================================
   11. RENDER MEMBERS
======================================== */

function renderMembers() {

    const memberList = document.getElementById("memberList");

    memberList.innerHTML = members.map(memberHTML).join("") ||
        `<div class="empty">No members added yet.</div>`;
}


/* ========================================
   12. RENDER TASKS
======================================== */

function renderTasks() {

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = tasks.map(task => {

        return `
            <div class="task-row">

                <div class="task-info">

                    <strong>${escapeHTML(task.title)}</strong>

                    <small>
                        Assigned to: ${escapeHTML(task.assignee || "Unassigned")}
                        · Due ${escapeHTML(task.due || "Not set")}
                    </small>

                </div>

                ${createBadge(task.status)}

                <select
                    onchange="changeTaskStatus(${task.id}, this.value)"
                    aria-label="Change task status">

                    <option value="Pending"
                        ${task.status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="In Progress"
                        ${task.status === "In Progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option value="Completed"
                        ${task.status === "Completed" ? "selected" : ""}>
                        Completed
                    </option>

                </select>

                <div class="button-group">

                    <button class="secondary-button"
                        onclick="openTaskForm(${task.id})">
                        Edit
                    </button>

                    <button class="danger-button"
                        onclick="deleteTask(${task.id})">
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("") || `<div class="empty">No tasks added yet.</div>`;
}


/* ========================================
   13. RENDER JOINERS
======================================== */

function renderJoiners() {

    const joinerList = document.getElementById("joinerList");

    if (!joiners.length) {

        joinerList.innerHTML = "";

        return;
    }

    joinerList.innerHTML = `
        <h3 style="margin-top:20px">Submitted Interests</h3>

        ${joiners.map(joiner => `
            <div class="member-row">

                <div class="avatar">
                    ${escapeHTML(getInitials(joiner.name))}
                </div>

                <div class="member-info">
                    <strong>${escapeHTML(joiner.name)}</strong>

                    <small>
                        ${escapeHTML(joiner.regno || "Registration not provided")}
                        · ${escapeHTML(joiner.task)}
                    </small>
                </div>

            </div>
        `).join("")}
    `;
}


/* ========================================
   14. RENDER FEEDBACK
======================================== */

function renderFeedback() {

    const summary = document.getElementById("feedbackSummary");

    if (!feedback.length) {

        summary.innerHTML =
            `<div class="empty">No feedback submitted yet.</div>`;

        return;
    }

    summary.innerHTML = feedback.slice().reverse().map(item => {

        return `
            <div class="feedback-item">

                <strong>
                    ${escapeHTML(item.name || "Anonymous member")}
                </strong>

                <p>
                    Workload:
                    ${escapeHTML(item.workload)}
                </p>

                <p>
                    ${escapeHTML(item.suggestion || "No suggestion provided")}
                </p>

                <small>
                    ${escapeHTML(item.date || "")}
                </small>

            </div>
        `;

    }).join("");
}


/* ========================================
   15. RENDER EVERYTHING
======================================== */

function renderAll() {

    renderDashboard();

    renderMembers();

    renderTasks();

    renderJoiners();

    renderFeedback();
}


/* ========================================
   16. ADD / EDIT MEMBER
======================================== */

function openMemberForm(memberId = null) {

    const container = document.getElementById("memberFormContainer");

    const existingMember = members.find(member =>
        member.id === memberId
    );

    const member = existingMember || {
        name: "",
        role: "",
        email: "",
        status: "Active"
    };


    container.classList.add("show");

    container.innerHTML = `

        <h3>${memberId ? "Edit Member" : "Add New Member"}</h3>

        <form id="memberForm" class="form">

            <label>
                Member Name

                <input
                    type="text"
                    name="name"
                    value="${escapeHTML(member.name)}"
                    required
                    placeholder="Enter member name">
            </label>


            <label>
                Role

                <input
                    type="text"
                    name="role"
                    value="${escapeHTML(member.role)}"
                    required
                    placeholder="Club lead, Design, Event team...">
            </label>


            <label>
                Email or Contact (optional)

                <input
                    type="text"
                    name="email"
                    value="${escapeHTML(member.email || "")}"
                    placeholder="Enter contact">
            </label>


            <label>
                Member Status

                <select name="status">

                    <option value="Active"
                        ${member.status === "Active" ? "selected" : ""}>
                        Active
                    </option>

                    <option value="Needs check-in"
                        ${member.status === "Needs check-in" ? "selected" : ""}>
                        Needs check-in
                    </option>

                </select>
            </label>


            <div class="form-buttons">

                <button class="primary-button" type="submit">
                    ${memberId ? "Update Member" : "Save Member"}
                </button>

                <button class="secondary-button"
                    type="button"
                    onclick="closeMemberForm()">
                    Cancel
                </button>

            </div>

        </form>
    `;


    document.getElementById("memberForm").addEventListener("submit", function(event) {

        event.preventDefault();

        const formData = new FormData(event.target);

        const name = formData.get("name").trim();
        const role = formData.get("role").trim();

        if (!name || !role) {

            showToast("Please enter name and role.");

            return;
        }

        const updatedMember = {
            id: memberId || Date.now(),
            name: name,
            role: role,
            email: formData.get("email").trim(),
            status: formData.get("status")
        };


        if (memberId) {

            members = members.map(member =>
                member.id === memberId ? updatedMember : member
            );

            showToast("Member updated successfully!");

        } else {

            members.push(updatedMember);

            showToast("New member added successfully!");
        }


        saveData();

        renderAll();

        closeMemberForm();

    });

}


function closeMemberForm() {

    const container = document.getElementById("memberFormContainer");

    container.innerHTML = "";

    container.classList.remove("show");
}


/* ========================================
   17. DELETE MEMBER
======================================== */

function deleteMember(memberId) {

    const member = members.find(item => item.id === memberId);

    if (!member) {
        return;
    }

    const confirmation = confirm(
        "Are you sure you want to remove " + member.name + "?"
    );

    if (!confirmation) {
        return;
    }


    // Remove member
    members = members.filter(item => item.id !== memberId);


    // Unassign their tasks
    tasks = tasks.map(task => {

        if (task.assignee === member.name) {

            return {
                ...task,
                assignee: ""
            };
        }

        return task;

    });


    saveData();

    renderAll();

    closeMemberForm();

    closeTaskForm();

    showToast("Member removed successfully!");
}


/* ========================================
   18. ADD / EDIT TASK
======================================== */

function openTaskForm(taskId = null) {

    const container = document.getElementById("taskFormContainer");

    const existingTask = tasks.find(task =>
        task.id === taskId
    );

    const task = existingTask || {
        title: "",
        assignee: "",
        due: "",
        status: "Pending"
    };


    // Create member dropdown options
    const memberOptions = members.map(member => {

        return `
            <option value="${escapeHTML(member.name)}"
                ${task.assignee === member.name ? "selected" : ""}>
                ${escapeHTML(member.name)}
            </option>
        `;

    }).join("");


    container.classList.add("show");

    container.innerHTML = `

        <h3>${taskId ? "Edit Task" : "Add New Task"}</h3>

        <form id="taskForm" class="form">

            <label>
                Task Title

                <input
                    type="text"
                    name="title"
                    value="${escapeHTML(task.title)}"
                    required
                    placeholder="Enter task title">
            </label>


            <label>
                Assign to Member

                <select name="assignee">

                    <option value="">Unassigned</option>

                    ${memberOptions}

                </select>
            </label>


            <label>
                Deadline

                <input
                    type="date"
                    name="due"
                    value="${escapeHTML(task.due || "")}">
            </label>


            <label>
                Task Status

                <select name="status">

                    <option value="Pending"
                        ${task.status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="In Progress"
                        ${task.status === "In Progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option value="Completed"
                        ${task.status === "Completed" ? "selected" : ""}>
                        Completed
                    </option>

                </select>
            </label>


            <div class="form-buttons">

                <button class="primary-button" type="submit">
                    ${taskId ? "Update Task" : "Save Task"}
                </button>

                <button class="secondary-button"
                    type="button"
                    onclick="closeTaskForm()">
                    Cancel
                </button>

            </div>

        </form>
    `;


    document.getElementById("taskForm").addEventListener("submit", function(event) {

        event.preventDefault();

        const formData = new FormData(event.target);

        const title = formData.get("title").trim();

        if (!title) {

            showToast("Please enter a task title.");

            return;
        }

        const updatedTask = {

            id: taskId || Date.now(),

            title: title,

            assignee: formData.get("assignee"),

            due: formData.get("due"),

            status: formData.get("status")

        };


        if (taskId) {

            tasks = tasks.map(item =>
                item.id === taskId ? updatedTask : item
            );

            showToast("Task updated successfully!");

        } else {

            tasks.push(updatedTask);

            showToast("Task added successfully!");
        }


        saveData();

        renderAll();

        closeTaskForm();

    });

}


function closeTaskForm() {

    const container = document.getElementById("taskFormContainer");

    container.innerHTML = "";

    container.classList.remove("show");
}


/* ========================================
   19. CHANGE TASK STATUS
======================================== */

function changeTaskStatus(taskId, newStatus) {

    tasks = tasks.map(task => {

        if (task.id === taskId) {

            return {
                ...task,
                status: newStatus
            };
        }

        return task;

    });

    saveData();

    renderAll();

    showToast("Task status updated!");
}


/* ========================================
   20. DELETE TASK
======================================== */

function deleteTask(taskId) {

    const task = tasks.find(item => item.id === taskId);

    if (!task) {
        return;
    }

    const confirmation = confirm(
        "Do you want to delete this task?"
    );

    if (!confirmation) {
        return;
    }


    tasks = tasks.filter(item => item.id !== taskId);

    saveData();

    renderAll();

    closeTaskForm();

    showToast("Task deleted successfully!");
}


/* ========================================
   21. NEW MEMBER FORM
======================================== */

document.getElementById("joinForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const formData = new FormData(event.target);

    const name = formData.get("name").trim();

    const task = formData.get("task");

    if (!name || !task) {

        showToast("Please complete the required details.");

        return;
    }


    joiners.push({

        id: Date.now(),

        name: name,

        regno: formData.get("regno").trim(),

        task: task,

        date: new Date().toLocaleString()

    });


    saveData();

    renderJoiners();

    event.target.reset();

    showToast("Your interest has been submitted!");
});


/* ========================================
   22. FEEDBACK FORM
======================================== */

document.getElementById("feedbackForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const formData = new FormData(event.target);

    feedback.push({

        id: Date.now(),

        name: formData.get("name").trim(),

        workload: formData.get("workload"),

        suggestion: formData.get("suggestion").trim(),

        date: new Date().toLocaleString()

    });


    saveData();

    renderFeedback();

    event.target.reset();

    showToast("Feedback submitted successfully!");
});


/* ========================================
   23. DATE DISPLAY
======================================== */

const today = new Date();

const dateText = today.toLocaleDateString("en-IN", {

    weekday: "long",

    day: "numeric",

    month: "long",

    year: "numeric"

});

document.querySelector(".top-label").textContent =
    "LPU STUDENT CLUB WORKSPACE · " + dateText.toUpperCase();


/* ========================================
   24. INITIAL WEBSITE LOAD
======================================== */

renderAll();


