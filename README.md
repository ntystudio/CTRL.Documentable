<img src="https://github.com/user-attachments/assets/db42f981-151f-4472-b902-252e69a76228" width="450" height="100%" />
<br/>
<br/>

CTRL Documentable is part of the [NTY.studio](https://www.nty.studio/) CTRL Framework, a library of utility plugins for Unreal Engine.

## Overview
CTRL Documentable is a plugin for Unreal Engine 5 that enables game developers to easily generate project documentation for all their Blueprint and C++ classes.


<img src="https://github.com/user-attachments/assets/621e54fb-4692-4a8c-a895-dc4a453b5a97" width="700" height="100%" />
<br/>
<br/>

## Features
- Selectively include the Blueprint and C++ classes you want to generate documentation for
- Automatic build and local server with node for viewing documentation
- Separated properties, functions, and nodes on a per-class basis
- Search and filtering within properties, functions, and nodes for a given class
- Images generated for Blueprint node classes

<br/>

## Prerequisites
- Unreal Engine 5.1+
- node (v??)

<br/>

## Get Started
Once CTRL Documentable is installed, you will see the window option at the bottom of the "File" menu option to bring up the documentation generator window.

<img src="https://github.com/user-attachments/assets/7034bc12-ce09-47ff-8a09-747db3dd7eb6" width="500" height="100%" />
<br/>
<br/>

Here you can selectively include which `Native Modules` you want to include for your C++ classes and which `Content Paths` you want to include for your Blueprint classes.

<img src="https://github.com/user-attachments/assets/37f7b00e-1369-4aff-a9d5-3b7ed78c51e5" width="500" height="100%" />
<br/>
<br/>

Once you hit "Generate Documentation", you'll see a notice in your editor which will persist until the documentation generation has finished. You can also view the status of the documentation generation in your output log.

<img src="https://github.com/user-attachments/assets/a5c510a6-7735-4af8-bb0a-33a398988eae" width="700" height="100%" />
<br/>
<br/>

Assuming you have the correct node version installed per the prerequisites, you will see a local server start and the local generated documentation will open in your browser.

<img src="https://github.com/user-attachments/assets/dba3b9f9-727b-4b3b-a2cf-835e8e4f7533" width="700" height="100%" />
<br/>
<br/>

## Feedback
If you come across an issue while using the plugin or have a suggestion to improve the plugin, feel free to [open an issue](https://github.com/ntystudio/CTRL-reference-visualizer/issues) or leave a post in our [discord server](https://discord.gg/ntystudio) (CTRL Framework section in discord below).

![image](https://github.com/user-attachments/assets/07b8c1d0-a582-46dd-80dc-452ee5cf6ce2)
<br/>
<br/>

## Contribution
Contributions from the community are welcome! If you decide to to contribute, we ask that you:
- Fork the repository
- Create a new branch
- Make your changes
- Submit a pull request

<br/>

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

Special thanks to [https://github.com/kamrann/KantanDocGenPlugin](https://github.com/kamrann/KantanDocGenPlugin) for the original inspiration and base building blocks.
