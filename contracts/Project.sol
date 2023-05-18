//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Project {
    enum statusEnum {
        Pitched,
        Scheduled,
        Ongoing,
        Completed,
        Closed
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
        uint256 equity;
        statusEnum status;
    }

    struct fundStruct {
        uint256 targetFunds;
        uint256 raisedFunds;
        uint256 remainingFunds;
    }

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
        address investerAddress,
        uint256 equity
    ) public returns (bool) {
        require(targetFunds > 0, "Target funds can't be zero.");

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
        project.equity = equity;
        project.status = statusEnum.Pitched;

        projects.push(project);
        projectExist[projectsCount] = true;
        projectsOf[address(this)] = project;

        emit Action(
            projectsCount++,
            "Idea Pitched",
            msg.sender,
            block.timestamp
        );

        return true;
    }

    function startProject(
        string memory userId,
        uint256 projectId,
        uint256 targetFunds,
        string memory investerId,
        address investerAddress,
        uint256 equity
    ) public returns (bool) {
        require(projectExist[projectId], "Project not found.");
        require(
            compareStrings(projects[projectId].userId, userId),
            "Only owner can start the project."
        );
        require(
            projects[projectId].status == statusEnum.Pitched,
            "Project is already started."
        );

        projects[projectId].projectFunds.targetFunds = targetFunds;
        projects[projectId].projectFunds.raisedFunds = 0;
        projects[projectId].projectFunds.remainingFunds = targetFunds;
        projects[projectId].investerId = investerId;
        projects[projectId].investerAddress = investerAddress;
        projects[projectId].equity = equity;
        projects[projectId].status = statusEnum.Scheduled;

        emit Action(
            projectId,
            "Project Scheduled",
            msg.sender,
            block.timestamp
        );

        return true;
    }

    // function updateProjectStatus(
    //     string memory userId,
    //     uint256 projectId,
    //     statusEnum status
    // ) public returns (bool) {
    //     require(projectExist[projectId], "Project not found.");
    //     require(
    //         compareStrings(projects[projectId].userId, userId),
    //         "Only owner can change status of the project."
    //     );

    //     projects[projectId].status = status;

    //     emit Action(
    //         projectsCount++,
    //         "Project Status Changed.",
    //         msg.sender,
    //         block.timestamp
    //     );

    //     return true;
    // }

    function updateModuleStatus(
        string memory userId,
        uint256 moduleId,
        uint256 projectId,
        statusEnum status
    ) public returns (bool) {
        require(moduleExist[moduleId], "Module not found.");
        require(
            compareStrings(projects[projectId].userId, userId),
            "Only owner can change status of the module."
        );

        modules[moduleId].status = status;

        emit Action(
            projectsCount++,
            "Module Status Changed.",
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
        require(
            projects[projectId].status != statusEnum.Pitched,
            "Project is not started yet."
        );
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

        if (startTime > block.timestamp) {
            module.status = statusEnum.Scheduled;
        } else if (startTime <= block.timestamp) {
            module.status = statusEnum.Ongoing;
        }

        modules.push(module);
        moduleExist[modulesCount] = true;
        modulesOf[address(this)] = module;

        projects[projectId].moduleStruct = module;
        projects[projectId].status = statusEnum.Ongoing;

        emit Action(
            modulesCount++,
            "Module Created",
            msg.sender,
            block.timestamp
        );
        return true;
    }

    function getProject(uint id) public returns (projectStructre memory) {
        require(projectExist[id], "Project not found.");
        updateAllModulesStatus();
        return projects[id];
    }

    function getAllProjects() public returns (projectStructre[] memory) {
        updateAllModulesStatus();
        return projects;
    }

    function getModule(uint id) public returns (moduleStructure memory) {
        require(moduleExist[id], "Module not found.");
        updateOneModuleStatus(id);
        return modules[id];
    }

    function getAllModules() public returns (moduleStructure[] memory) {
        updateAllModulesStatus();

        return modules;
    }

    function updateOneModuleStatus(uint id) public {
        if (modules[id].startTime > block.timestamp) {
            modules[id].status = statusEnum.Scheduled;
        }
        if (modules[id].startTime <= block.timestamp) {
            modules[id].status = statusEnum.Ongoing;
        }
        if (modules[id].endTime < block.timestamp) {
            modules[id].status = statusEnum.Completed;
        }
    }

    function updateAllModulesStatus() public {
        for (uint256 i = 0; i < modules.length; i++) {
            if (modules[i].startTime > block.timestamp) {
                modules[i].status = statusEnum.Scheduled;
            }
            if (modules[i].startTime <= block.timestamp) {
                modules[i].status = statusEnum.Ongoing;
            }
            if (modules[i].endTime < block.timestamp) {
                modules[i].status = statusEnum.Completed;
            }
        }
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

        require(
            block.timestamp >= modules[moduleId].startTime,
            "Module not started, please wait."
        );
        require(
            block.timestamp <= modules[moduleId].endTime,
            "Deadline has passed for this module."
        );

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

        // if (
        //     modules[moduleId].moduleFunds.raisedFunds >=
        //     modules[moduleId].moduleFunds.targetFunds
        // ) {
        //     modules[moduleId].status = statusEnum.Completed;
        // } else {
        //     modules[moduleId].status = statusEnum.Ongoing;
        // }

        // if (
        //     projects[projectId].projectFunds.raisedFunds >=
        //     projects[projectId].projectFunds.targetFunds
        // ) {
        //     projects[projectId].status = statusEnum.Completed;
        // } else {
        //     projects[projectId].status = statusEnum.Ongoing;
        // }

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
            modules[moduleId].moduleFunds.raisedFunds > 0,
            "Not enough balance to withdraw."
        );

        address payable owner = payable(ownerAddress);

        owner.transfer(modules[moduleId].moduleFunds.raisedFunds);

        userStats.push(
            userStatsStruct(
                userId,
                modules[moduleId].moduleFunds.raisedFunds,
                true,
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

        // if (
        //     modules[moduleId].moduleFunds.raisedFunds >=
        //     modules[moduleId].moduleFunds.targetFunds
        // ) {
        //     modules[moduleId].status = statusEnum.Completed;
        // } else {
        //     modules[moduleId].status = statusEnum.Ongoing;
        // }

        // if (
        //     projects[projectId].projectFunds.raisedFunds >=
        //     projects[projectId].projectFunds.targetFunds
        // ) {
        //     projects[projectId].status = statusEnum.Completed;
        // } else {
        //     projects[projectId].status = statusEnum.Ongoing;
        // }

        emit Action(
            moduleId,
            "Module Funds Withdrawn",
            msg.sender,
            block.timestamp
        );
    }

    function compareStrings(
        string memory a,
        string memory b
    ) private pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
