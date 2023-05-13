//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Project {
    enum statusEnum {
        NotStarted,
        Ongoing,
        Upcoming,
        Paid,
        Completed,
        Issued
    }

    event Action(
        uint256 id,
        string actionType,
        address indexed executor,
        uint256 timestamp
    );

    struct userStatsStruct {
        string userId;
        uint contribution;
        bool isFundsDonating;
        uint timestamp;
        string description;
    }

    struct projectStructre {
        address creator;
        string userId;
        string categoryId;
        uint256 projectId;
        string title;
        string description;
        fundStruct projectFunds;
        string imageURL;
        moduleStructure moduleStruct;
        string investerId;
        address investerAddress;
        statusEnum status;
    }

    struct fundStruct {
        uint256 targetFunds;
        uint256 raisedFunds;
        uint256 remainingFunds;
    }

    address projectCreator;

    uint projectsCount;
    uint modulesCount;

    projectStructre[] projects;
    moduleStructure[] modules;
    userStatsStruct[] userStats;

    uint public contractBalance;

    mapping(uint => bool) projectExist;
    mapping(uint => bool) moduleExist;

    mapping(address => projectStructre) projectsOf;
    mapping(address => moduleStructure) modulesOf;

    function createProject(
        string memory userId,
        string memory categoryId,
        string memory title,
        string memory description,
        uint256 targetFunds,
        string memory imageURL,
        string memory investerId,
        address investerAddress
    ) public returns (bool) {
        require(targetFunds > 0, "Target funds can't be zero.");

        projectCreator = msg.sender;

        projectStructre memory project;

        project.creator = msg.sender;
        project.userId = userId;
        project.categoryId = categoryId;
        project.projectId = projectsCount;
        project.title = title;
        project.description = description;
        project.projectFunds.targetFunds = targetFunds;
        project.projectFunds.raisedFunds = 0;
        project.projectFunds.remainingFunds = targetFunds;
        project.imageURL = imageURL;
        project.investerId = investerId;
        project.investerAddress = investerAddress;
        project.status = statusEnum.NotStarted;

        projects.push(project);
        projectExist[projectsCount] = true;
        projectsOf[address(this)] = project;

        emit Action(
            projectsCount++,
            "Project Created",
            msg.sender,
            block.timestamp
        );

        return true;
    }

    struct moduleStructure {
        uint256 projectId;
        uint256 moduleId;
        string title;
        string description;
        fundStruct moduleFunds;
        uint256 startTime;
        uint256 endTime;
        statusEnum status;
    }

    function createProjectModule(
        uint256 projectId,
        string memory title,
        string memory description,
        uint256 targetFunds,
        uint256 startTime,
        uint256 endTime
    ) public returns (bool) {
        require(projectExist[projectId], "Project not found.");
        require(targetFunds > 0, "Target funds can't be zero.");

        moduleStructure memory module;

        module.projectId = projectId;
        module.moduleId = modulesCount;
        module.title = title;
        module.description = description;
        module.moduleFunds.targetFunds = targetFunds;
        module.moduleFunds.raisedFunds = 0;
        module.moduleFunds.remainingFunds = targetFunds;
        module.startTime = startTime;
        module.endTime = endTime;
        module.status = statusEnum.NotStarted;

        modules.push(module);
        moduleExist[modulesCount] = true;
        modulesOf[address(this)] = module;

        projects[projectId].moduleStruct = module;
        projects[projectId].status = statusEnum.NotStarted;

        emit Action(
            modulesCount++,
            "Module Created",
            msg.sender,
            block.timestamp
        );
        return true;
    }

    function getProject(uint id) public view returns (projectStructre memory) {
        require(projectExist[id], "Project not found.");

        return projects[id];
    }

    function getModule(uint id) public view returns (moduleStructure memory) {
        require(moduleExist[id], "Module not found.");

        return modules[id];
    }

    function getAllProjects() public view returns (projectStructre[] memory) {
        return projects;
    }

    function getAllModules() public view returns (moduleStructure[] memory) {
        return modules;
    }

    function getProjectRaisedFunds(uint id) public view returns (uint256) {
        require(projectExist[id], "Project not found.");

        return projects[id].projectFunds.raisedFunds;
    }

    function getProjectRemainingFunds(uint id) public view returns (uint256) {
        require(projectExist[id], "Project not found.");

        return projects[id].projectFunds.remainingFunds;
    }

    function getModuleRaisedFunds(uint id) public view returns (uint256) {
        require(moduleExist[id], "Module not found.");

        return modules[id].moduleFunds.raisedFunds;
    }

    function getModuleRemainingFunds(uint id) public view returns (uint256) {
        require(moduleExist[id], "Module not found.");

        return modules[id].moduleFunds.remainingFunds;
    }

    function updateProjectStatus(
        uint projectId,
        statusEnum status
    ) public returns (bool) {
        require(projectExist[projectId], "Project not found.");

        projects[projectId].status = status;

        emit Action(
            projectId,
            "Project Status Updated",
            msg.sender,
            block.timestamp
        );
        return true;
    }

    function getProjectStatus(uint id) public view returns (statusEnum) {
        require(projectExist[id], "Project not found.");

        return projects[id].status;
    }

    function updateModuleStatus(
        uint moduleId,
        statusEnum status
    ) public returns (bool) {
        require(moduleExist[moduleId], "Module not found.");

        modules[moduleId].status = status;

        emit Action(
            moduleId,
            "Module Status Updated",
            msg.sender,
            block.timestamp
        );

        return true;
    }

    function getModuleStatus(uint id) public view returns (statusEnum) {
        require(moduleExist[id], "Module not found.");

        return modules[id].status;
    }

    function getCurrentTimestamp() public view returns (uint) {
        return block.timestamp;
    }

    function getCurrentTimestampWithDuration(
        uint duration
    ) public view returns (uint) {
        return block.timestamp + duration;
    }

    function concatStrings(
        string memory a,
        string memory b,
        string memory c,
        string memory d
    ) public pure returns (string memory) {
        return string(abi.encodePacked(a, b, c, d));
    }

    function getUserStats() public view returns (userStatsStruct[] memory) {
        return userStats;
    }

    function fundsToProjectModule(
        uint projectId,
        uint moduleId,
        string memory userId
    ) public payable returns (bool) {
        require(projectExist[projectId], "Project not found.");
        require(moduleExist[moduleId], "Module not found.");

        require(msg.value > 0 ether, "Ether must be greater than zero.");

        // require(modules[moduleId].startTime <= block.timestamp , "Module not started, please wait.");
        // require(modules[moduleId].endTime <= block.timestamp, "Deadline has passed for this module.");

        require(
            modules[moduleId].moduleFunds.raisedFunds <=
                modules[moduleId].moduleFunds.targetFunds,
            "Target funds has raised for this module, you can't donate now."
        );

        require(
            modules[moduleId].moduleFunds.raisedFunds + msg.value <=
                modules[moduleId].moduleFunds.targetFunds,
            "Can't donate this ammount, please try again."
        );

        userStats.push(
            userStatsStruct(
                userId,
                msg.value,
                true,
                block.timestamp,
                concatStrings(
                    "Donate funds to project titled as ",
                    projects[projectId].title,
                    ", to it's module titled as ",
                    modules[moduleId].title
                )
            )
        );

        modules[moduleId].moduleFunds.raisedFunds += msg.value;
        modules[moduleId].moduleFunds.remainingFunds -= msg.value;

        projects[projectId].projectFunds.raisedFunds += msg.value;
        projects[projectId].projectFunds.remainingFunds -= msg.value;

        contractBalance += msg.value;

        modules[moduleId].status = statusEnum.Paid;

        emit Action(
            moduleId,
            "Funds Donated for Module",
            msg.sender,
            block.timestamp
        );

        return true;
    }

    function withdrawFunds(
        address ownerAddress,
        uint projectId,
        uint moduleId,
        string memory userId
    ) public {
        require(
            modules[moduleId].status != statusEnum.Completed,
            "Module has already completed."
        );
        require(
            ownerAddress == projectCreator,
            "Only creater can withdraw funds."
        );
        require(
            modules[moduleId].moduleFunds.raisedFunds > 0,
            "Not enough balance to withdraw."
        );

        address payable owner = payable(ownerAddress);

        owner.transfer(modules[moduleId].moduleFunds.raisedFunds);

        userStats.push(
            userStatsStruct(
                userId,
                modules[moduleId].moduleFunds.raisedFunds,
                false,
                block.timestamp,
                concatStrings(
                    "Withdraw funds from project titled as ",
                    projects[projectId].title,
                    ", and from it's module titled as ",
                    modules[moduleId].title
                )
            )
        );

        contractBalance -= modules[moduleId].moduleFunds.raisedFunds;

        modules[moduleId].status = statusEnum.Completed;

        emit Action(moduleId, "Module Completed", msg.sender, block.timestamp);
    }
}
