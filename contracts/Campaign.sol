//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Campaign {
    enum statusEnum {
        Scheduled,
        Ongoing,
        Completed
    }

    event Action(
        uint256 campaignId,
        string actionType,
        address indexed executor,
        uint256 timestamp
    );

    struct funderStruct {
        address funder;
        uint contribution;
        uint timestamp;
    }

    struct statsStruct {
        uint totalCampaigns;
        uint totalFunding;
        uint totalDonation;
    }

    struct campaignStructre {
        address creator;
        string userId;
        string categoryId;
        uint256 campaignId;
        string title;
        string description;
        uint256 targetFunds;
        uint256 startTime;
        uint256 deadline;
        uint256 raisedFunds;
        uint256 remainingFunds;
        string imageURL;
        statusEnum status;
        bool isWithdraw;
    }

    // address campaignCreator;
    uint campaignsCount;
    campaignStructre[] campaigns;
    userStatsStruct[] userStats;
    statsStruct stats;
    uint public contractBalance;

    mapping(uint => bool) campaignExist;
    mapping(address => campaignStructre) campaignsOf;
    mapping(uint => funderStruct[]) fundersOf;

    function createCampaign(
        string memory userId,
        string memory categoryId,
        string memory title,
        string memory description,
        uint256 targetFunds,
        uint256 startTime,
        uint256 deadline,
        string memory imageURL
    ) public returns (bool) {
        campaignStructre memory campaign;

        campaign.userId = userId;
        campaign.creator = msg.sender;
        campaign.categoryId = categoryId;
        campaign.campaignId = campaignsCount;
        campaign.title = title;
        campaign.description = description;
        campaign.targetFunds = targetFunds;
        campaign.startTime = startTime;
        campaign.deadline = deadline;
        campaign.raisedFunds = 0;
        campaign.remainingFunds = targetFunds;
        campaign.imageURL = imageURL;
        campaign.isWithdraw = false;

        if (startTime > block.timestamp) {
            campaign.status = statusEnum.Scheduled;
        } else if (startTime <= block.timestamp) {
            campaign.status = statusEnum.Ongoing;
        }

        campaigns.push(campaign);
        campaignExist[campaignsCount] = true;
        campaignsOf[address(this)] = campaign;
        stats.totalCampaigns += 1;

        emit Action(
            campaignsCount++,
            "Campaign Created",
            msg.sender,
            block.timestamp
        );
        return true;
    }

    function donateFunds(
        uint campaignId,
        string memory userId
    ) public payable returns (bool) {
        require(
            campaigns[campaignId].isWithdraw == false,
            "Campaign has closed."
        );
        require(
            campaigns[campaignId].status != statusEnum.Completed,
            "Campaign has completed."
        );
        require(msg.value > 0 ether, "Ether must be greater than zero.");
        require(campaignExist[campaignId], "Campaign not found.");
        require(
            block.timestamp >= campaigns[campaignId].startTime,
            "Not started yet."
        );
        require(
            block.timestamp <= campaigns[campaignId].deadline,
            "Deadline has passed."
        );

        require(
            campaigns[campaignId].raisedFunds <=
                campaigns[campaignId].targetFunds,
            "Target funds has raised, you can't donate now."
        );
        require(
            campaigns[campaignId].raisedFunds + msg.value <=
                campaigns[campaignId].targetFunds,
            "Can't donate this ammount, please try again."
        );

        require(
            !compareStrings(campaigns[campaignId].userId, userId),
            "Creator can't funds his own campaign."
        );

        stats.totalFunding += 1;
        stats.totalDonation += msg.value;

        campaigns[campaignId].raisedFunds += msg.value;
        campaigns[campaignId].remainingFunds =
            campaigns[campaignId].targetFunds -
            campaigns[campaignId].raisedFunds;

        contractBalance += msg.value;

        fundersOf[campaignId].push(
            funderStruct(msg.sender, msg.value, block.timestamp)
        );

        userStats.push(
            userStatsStruct(
                userId,
                msg.value,
                true,
                block.timestamp,
                concatenateStrings(
                    "Donate funds to campaign titled as ",
                    campaigns[campaignId].title
                )
            )
        );

        emit Action(
            campaignId,
            "Funds Donated for Campaign",
            msg.sender,
            block.timestamp
        );
        return true;
    }

    function concatenateStrings(
        string memory str1,
        string memory str2
    ) private pure returns (string memory) {
        return string(abi.encodePacked(str1, str2));
    }

    struct userStatsStruct {
        string userId;
        uint contribution;
        bool isFundsDonating;
        uint timestamp;
        string description;
    }

    function getCampaignFunders(
        uint id
    ) public view returns (funderStruct[] memory) {
        return fundersOf[id];
    }

    function getUserStats() public view returns (userStatsStruct[] memory) {
        return userStats;
    }

    function getCampaign(uint id) public returns (campaignStructre memory) {
        require(campaignExist[id], "Campaign not found.");

        if (campaigns[id].startTime > block.timestamp) {
            campaigns[id].status = statusEnum.Scheduled;
        }
        if (campaigns[id].startTime <= block.timestamp) {
            campaigns[id].status = statusEnum.Ongoing;
        }
        if (campaigns[id].deadline < block.timestamp) {
            campaigns[id].status = statusEnum.Completed;
        }

        return campaigns[id];
    }

    function getAllCampaigns() public returns (campaignStructre[] memory) {
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i].startTime > block.timestamp) {
                campaigns[i].status = statusEnum.Scheduled;
            }
            if (campaigns[i].startTime <= block.timestamp) {
                campaigns[i].status = statusEnum.Ongoing;
            }
            if (campaigns[i].deadline < block.timestamp) {
                campaigns[i].status = statusEnum.Completed;
            }
        }

        return campaigns;
    }

    function getRaisedFunds(uint id) public view returns (uint256) {
        require(campaignExist[id], "Campaign not found.");

        return campaigns[id].raisedFunds;
    }

    function getRemainingFunds(uint id) public view returns (uint256) {
        require(campaignExist[id], "Campaign not found.");

        return campaigns[id].remainingFunds;
    }

    function withdrawFunds(
        address ownerAddress,
        uint campaignId,
        string memory userId
    ) public returns (bool) {
        require(
            ownerAddress == campaigns[campaignId].creator,
            "Only createor can withdraw funds, creator address doesn't match."
        );
        require(
            compareStrings(campaigns[campaignId].userId, userId),
            "Only creator can withdraw funds, userId doesn't match."
        );
        require(
            campaigns[campaignId].raisedFunds > 0,
            "Not enough balance to withdraw."
        );
        require(
            campaigns[campaignId].isWithdraw == false,
            "Funds of this campaign already withdrawn."
        );

        address payable owner = payable(ownerAddress);

        userStats.push(
            userStatsStruct(
                userId,
                campaigns[campaignId].raisedFunds,
                false,
                block.timestamp,
                concatenateStrings(
                    "Withdraw funds from campaign titled as ",
                    campaigns[campaignId].title
                )
            )
        );

        owner.transfer(campaigns[campaignId].raisedFunds);

        contractBalance -= campaigns[campaignId].raisedFunds;

        campaigns[campaignId].status = statusEnum.Completed;
        campaigns[campaignId].isWithdraw = true;

        emit Action(
            campaignId,
            "Campaign Completed",
            msg.sender,
            block.timestamp
        );

        return true;
    }

    function compareStrings(
        string memory a,
        string memory b
    ) private pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
