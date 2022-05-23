const loading = document.querySelector(".loading");
const photoID = document.getElementById("photoID");
const albumID = document.getElementById("albumID");
const getPhotoBTN = document.getElementById("getPhoto");
const getPhotosBTN = document.getElementById("getPhotos");
const photoContainer = document.querySelector(".photo__container");

getPhotoBTN.addEventListener("click", async () => {
  const value = photoID.value;
  if (!value.length) return;
  try {
    photoContainer.innerHTML = "";
    loading.innerText = "Loading...";
    const response = await fetch(`/photos/${value}`);
    const data = await response.json();
    const list = document.createElement("ul");
    const photo = `<li> 
                  <p>ID: ${data.id} </p>
                  <p>Title: ${data.title} </p>
              </li>`;

    loading.innerText = "";
    list.innerHTML = photo;
    photoContainer.appendChild(list);
    console.log(data, "here", list);
  } catch (error) {
    loading.innerText = "";
    alert(error.message);
  }
});

getPhotosBTN.addEventListener("click", async () => {
  const value = albumID.value;
  if (!value.length) return;
  try {
    photoContainer.innerHTML = "";
    loading.innerText = "Loading...";
    const response = await fetch(`/photos?albumId=${value}`);
    const data = await response.json();
    const list = document.createElement("ul");
    const result = data.map((photo) => {
      return `<li> 
                  <p>ID: ${photo.id} </p>
                  <p>Title: ${photo.title} </p>
              </li>`;
    });
    loading.innerText = "";
    list.innerHTML = result.join("<br />");
    photoContainer.appendChild(list);
  } catch (error) {
    loading.innerText = "";
    alert(error.message);
  }
});
