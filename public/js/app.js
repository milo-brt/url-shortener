const alertDiv = document.getElementById("alert");
const alertTitle = document.getElementById("alert-title");
const alertMessage = document.getElementById("alert-message");
const linksList = document.getElementById("links");

function generateHandle() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function setAlert(title, message, type) {
  alertTitle.innerHTML = title;
  alertMessage.innerHTML = message;
  alertDiv.classList.add(type);
  alertDiv.classList.add("see");
  setTimeout(() => {
    if (alertDiv.classList.contains("see")) {
      alertDiv.classList.remove("see");
    }
  }, 5000);
}

function activateAction(button, handle) {
  fetch(`/urls/api/links/${handle}`, {
    method: "PUT",
  })
    .then((res) => {
      if (!res.ok) {
        res.json().then((body) => {
          if (body) {
            setAlert("Error", body.message, "inactive");
          } else {
            setAlert("Error", "", "inactive");
          }
        });
      } else {
        setAlert("Success", `Link /${handle} activated`, "active");
        button.parentElement
          .querySelector(".status")
          .classList.remove("inactive");
        button.parentElement.querySelector(".status").classList.add("active");
        button.parentElement.querySelector(".status p").innerHTML = "Active";
        button.innerHTML = "Deactivate";
        var new_element = button.cloneNode(true);
        button.parentNode.replaceChild(new_element, button);
        new_element.addEventListener("click", () =>
          deactivateAction(new_element, handle),
        );
      }
    })
    .catch((error) => {
      setAlert("Error", error, "inactive");
    });
}

function deactivateAction(button, handle) {
  fetch(`/urls/api/links/${handle}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) {
        res.json().then((body) => {
          if (body) {
            setAlert("Error", body.message, "inactive");
          } else {
            setAlert("Error", "", "inactive");
          }
        });
      } else {
        setAlert("Success", `Link /${handle} deactivated`, "active");
        button.parentElement
          .querySelector(".status")
          .classList.remove("active");
        button.parentElement.querySelector(".status").classList.add("inactive");
        button.parentElement.querySelector(".status p").innerHTML = "Inactive";
        button.innerHTML = "Activate";
        var new_element = button.cloneNode(true);
        button.parentNode.replaceChild(new_element, button);
        new_element.addEventListener("click", () =>
          activateAction(new_element, handle),
        );
      }
    })
    .catch((error) => {
      setAlert("Error", error, "inactive");
    });
}

function addLink(link) {
  const linkItem = document.createElement("div");
  linkItem.classList.add("link");
  linkItem.id = link.handle;
  const firstLine = document.createElement("p");
  const firstLineAnchor = document.createElement("a");
  firstLineAnchor.href = `https://milobrt.fr/${link.handle}`;
  firstLineAnchor.innerHTML = `/${link.handle}`;
  firstLine.appendChild(firstLineAnchor);
  firstLine.innerHTML += ` · ${link.hits} Click` + (link.hits > 1 ? "s" : "");
  linkItem.appendChild(firstLine);
  const secondLine = document.createElement("a");
  secondLine.href = link.url;
  const temp = new URL(link.url);
  secondLine.innerHTML =
    temp.host + (temp.pathname !== "/" ? temp.pathname : "");
  linkItem.appendChild(secondLine);
  const thirdLine = document.createElement("p");
  thirdLine.innerHTML = `Created on ${new Date(link.createdAt).toLocaleDateString("en-gb", { year: "numeric", month: "long", day: "numeric" })}`;
  linkItem.appendChild(thirdLine);
  const fourthLine = document.createElement("div");
  fourthLine.classList.add("tools");
  if (link.active) {
    const deactivateButton = document.createElement("button");
    deactivateButton.innerHTML = "Deactivate";
    deactivateButton.addEventListener("click", () =>
      deactivateAction(deactivateButton, link.handle),
    );
    fourthLine.appendChild(deactivateButton);
    const status = document.createElement("div");
    status.classList.add("status", "active");
    const statusP = document.createElement("p");
    statusP.innerHTML = "Active";
    status.appendChild(statusP);
    fourthLine.appendChild(status);
  } else {
    const activateButton = document.createElement("button");
    activateButton.innerHTML = "Activate";
    activateButton.addEventListener("click", () =>
      activateAction(activateButton, link.handle),
    );
    fourthLine.appendChild(activateButton);
    const status = document.createElement("div");
    status.classList.add("status", "inactive");
    const statusP = document.createElement("p");
    statusP.innerHTML = "Inactive";
    status.appendChild(statusP);
    fourthLine.appendChild(status);
  }
  linkItem.appendChild(fourthLine);
  linksList.appendChild(linkItem);
}

function signOut() {
  fetch("/urls/logout", {
    method: "POST",
  })
    .then((res) => {
      if (!res.ok) {
        res.json().then((body) => {
          if (body) {
            setAlert("Error", body.message, "inactive");
          } else {
            setAlert("Error", "", "inactive");
          }
        });
      } else {
        window.location.href =
          "https://idp.milobrt.fr/logout?service=6669c7c9d8923458c086e421";
      }
    })
    .catch((error) => {
      setAlert("Error", error, "inactive");
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const openMenuButton = document.getElementById("pfp");
  const menu = document.getElementById("menu");
  const form = document.getElementById("le-form");

  document.addEventListener("click", (e) => {
    if (e.target.id !== "pfp" && !menu.contains(e.target)) {
      if (menu.classList.contains("see")) {
        menu.classList.remove("see");
      }
    }
  });
  openMenuButton.addEventListener("click", () => {
    if (menu.classList.contains("see")) {
      menu.classList.remove("see");
    } else {
      menu.classList.add("see");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.handle.value) {
      form.handle.value = generateHandle();
    }
    fetch("/urls/api/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: form.url.value,
        handle: form.handle.value,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          res.json().then((body) => {
            if (body) {
              setAlert("Error", body.message, "inactive");
            } else {
              setAlert("Error", "", "inactive");
            }
          });
        } else {
          return res.json();
        }
      })
      .then((link) => {
        if (link) {
          addLink(link);
          form.url.value = "";
          form.handle.value = "";
          setAlert("Success", `Link /${link.handle} created`, "active");
        }
      })
      .catch((error) => {
        setAlert("Error", error, "inactive");
      });
  });

  fetch("/urls/api/links")
    .then((res) => {
      if (!res.ok) {
        res.json().then((body) => {
          if (body) {
            setAlert("Error", body.message, "inactive");
          } else {
            setAlert("Error", "", "inactive");
          }
        });
      } else {
        return res.json();
      }
    })
    .then((links) => {
      links.forEach((link) => {
        addLink(link);
      });
    })
    .catch((error) => {
      setAlert("Error", error, "inactive");
    });
});
