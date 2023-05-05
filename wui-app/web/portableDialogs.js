const savebtn = document.querySelector("#savebtn"),
	savedata = document.querySelector("#savedata"),
	readbtn = document.querySelector("#readbtn"),
	readdata = document.querySelector("#readdata"),
	selectfolderbtn = document.querySelector("#selectfolderbtn"),
	selectfolderdata = document.querySelector("#selectfolderdata"),
	messagebtn = document.querySelector("#messagebtn"),
	messageresp = document.querySelector("#messageresp"),
	notifybtn = document.querySelector("#notifybtn");

savebtn.addEventListener("click", async() => {
	let res = await Wui.writeFileDialog('myfile.txt');
	if(res != '') res = await Wui.writeFile(res.path, savedata.innerText + '\n');
});

readbtn.addEventListener("click", async() => {
	let res = await Wui.readFileDialog();

	if(res.path != '') {
		res = await Wui.readFile(res.path);
		readdata.innerHTML = res.data.replaceAll('\\n', '\n');
	}
});

selectfolderbtn.addEventListener("click", async() => {
	let res = await Wui.selectFolderDialog('Select a file');
	selectfolderdata.innerHTML = res.path;
});

messagebtn.addEventListener("click", async() => {
	let res = await Wui.message("Message", "This is an info message", "info");
	messageresp.innerText = `Message resp: ${res}`;
});

notifybtn.addEventListener("click", async() => {
	await Wui.notify("Notification", "This is a warning notification", "warning");
	let r = 1;
});
