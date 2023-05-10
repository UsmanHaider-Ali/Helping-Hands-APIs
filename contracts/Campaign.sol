//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Campaign {
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
        uint256 deadline;
        uint256 raisedFunds;
        uint256 remainingFunds;
        string imageURL;
        bool isOpened;
    }

    address campaignCreator;
    uint public campaignsCount;
    campaignStructre[] campaigns;
    statsStruct public stats;
    uint public contractBalance;

    mapping(uint => bool) public campaignExist;
    mapping(address => campaignStructre) public campaignsOf;
    mapping(uint => funderStruct[]) fundersOf;

    function createCampaign(
        string memory userId,
        string memory categoryId,
        string memory title,
        string memory description,
        uint256 targetFunds,
        uint256 deadline,
        string memory imageURL
    ) public {
        campaignCreator = msg.sender;

        campaignStructre memory campaign;

        campaign.userId = userId;
        campaign.creator = msg.sender;
        campaign.categoryId = categoryId;
        campaign.campaignId = campaignsCount;
        campaign.title = title;
        campaign.description = description;
        campaign.targetFunds = targetFunds;
        campaign.deadline = deadline;
        campaign.raisedFunds = 0;
        campaign.remainingFunds = targetFunds;
        campaign.imageURL = imageURL;
        campaign.isOpened = true;

        campaigns.push(campaign);
        campaignExist[campaignsCount] = true;
        campaignsOf[address(this)] = campaign;
        stats.totalCampaigns += 1;

        campaignsCount += 1;
    }

    function updateCampaign(
        uint256 campaignId,
        string memory title,
        string memory description,
        string memory imageURL,
        address creater
    ) public {
        require(campaigns[campaignId].isOpened, "Campaign has closed.");
        require(
            creater == campaigns[campaignId].creator,
            "Unauthorized Entity."
        );

        campaigns[campaignId].title = title;
        campaigns[campaignId].description = description;
        campaigns[campaignId].imageURL = imageURL;
    }

    function donateFunds(uint id) public payable {
        require(campaigns[id].isOpened, "Campaign has closed.");
        require(msg.value > 0 ether, "Ether must be greater than zero.");
        require(campaignExist[id], "Campaign not found.");
        require(
            block.timestamp >= campaigns[id].deadline,
            "Deadline has passed."
        );
        require(
            campaigns[id].raisedFunds <= campaigns[id].targetFunds,
            "Target funds has raised, you can't donate now."
        );
        require(
            campaigns[id].raisedFunds + msg.value <= campaigns[id].targetFunds,
            "Can't donate this ammount, please try again."
        );

        stats.totalFunding += 1;
        stats.totalDonation += msg.value;

        campaigns[id].raisedFunds += msg.value;
        campaigns[id].remainingFunds =
            campaigns[id].targetFunds -
            campaigns[id].raisedFunds;

        contractBalance += msg.value;

        fundersOf[id].push(
            funderStruct(msg.sender, msg.value, block.timestamp)
        );
    }

    function getCampaign(
        uint id
    ) public view returns (campaignStructre memory) {
        require(campaignExist[id], "Campaign not found.");

        return campaigns[id];
    }

    function getAllCampaigns() public view returns (campaignStructre[] memory) {
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

    function withdrawFunds(address ownerAddress, uint id) public {
        require(campaigns[id].isOpened, "Campaign has closed.");
        require(
            ownerAddress == campaignCreator,
            "Only creater can withdraw funds."
        );
        require(
            campaigns[id].raisedFunds > 0,
            "Not enough balance to withdraw."
        );

        address payable owner = payable(ownerAddress);

        owner.transfer(campaigns[id].raisedFunds);

        contractBalance -= campaigns[id].raisedFunds;

        campaigns[id].isOpened = false;
    }
}
