//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Campaign {
    address campaignCreator;
    string userId;
    string title;
    string description;
    string categoryId;
    uint256 targetFunds;
    uint256 startTime;
    uint256 deadline;
    uint256 raisedFunds;
    uint256 noOfContributors;
    
    mapping(address => uint256) contributorsList;

    bool isWithdrawOnce;

    struct CampaignStructre {
        address creator;
        string userId;
        string title;
        string description;
        string categoryId;
        uint256 targetFunds;
        uint256 startTime;
        uint256 deadline;
        uint256 raisedFunds;
        uint256 remainingFunds;
        uint256 noOfContributors;
    }

    mapping(address => CampaignStructre) public contractsMapList;

    CampaignStructre[] contractsStructList;

    function createCampaign(
        string memory _userId,
        string memory _title,
        string memory _description,
        string memory _categoryId,
        uint256 _targetFunds,
        uint256 _deadline,
        uint256 _startTime
    ) public {
        userId = _userId;
        title = _title;
        description = _description;
        categoryId = _categoryId;
        targetFunds = _targetFunds;
        startTime = block.timestamp + _startTime;
        deadline = startTime + _deadline;
        campaignCreator = msg.sender;

        CampaignStructre memory campaignStructre = CampaignStructre(
            msg.sender,
            _userId,
            _title,
            _description,
            _categoryId,
            _targetFunds,
            startTime,
            deadline,
            raisedFunds,
            targetFunds,
            noOfContributors
        );

        contractsMapList[address(this)] = campaignStructre;

        contractsStructList.push(campaignStructre);

        isWithdrawOnce = false;
    }

    function getContractAddress() public view returns (address) {
        return address(this);
    }

    function getCampaignDetails()
        public
        view
        returns (CampaignStructre memory)
    {
        return contractsMapList[address(this)];
    }

    function getCampaignsCount() public view returns (uint256) {
        return contractsStructList.length;
    }

    function getCampaign(
        uint256 _index
    ) public view returns (string memory, string memory, uint256, uint256) {
        require(_index < contractsStructList.length, "Index out of bounds");
        CampaignStructre memory campaign = contractsStructList[_index];
        return (
            campaign.title,
            campaign.description,
            campaign.targetFunds,
            campaign.deadline
        );
    }

    function getAllContracts() public view returns (CampaignStructre[] memory) {
        return contractsStructList;
    }

    function sendFunds() public payable {
        require(isWithdrawOnce == false, "Campaign has closed.");

        require(block.timestamp > startTime, "Not started yet.");

        require(block.timestamp < deadline, "Deadline has passed.");

        require(msg.value > 0, "Please send valid funds.");

        require(raisedFunds <= targetFunds, "Target goal has been acheived.");

        require(
            msg.value <= targetFunds,
            "Please check target amount and then pay."
        );

        require(
            msg.sender != campaignCreator,
            "Creator can not fund his own campaings."
        );

        if (contributorsList[msg.sender] == 0) {
            noOfContributors++;
        }

        contributorsList[msg.sender] += msg.value;

        raisedFunds += msg.value;

        if (raisedFunds > targetFunds) {
            address payable lastFunder = payable(msg.sender);
            lastFunder.transfer(raisedFunds - targetFunds);
            raisedFunds = targetFunds;
            contributorsList[msg.sender] = raisedFunds - targetFunds;
        }

        contractsMapList[address(this)].raisedFunds = raisedFunds;
        contractsMapList[address(this)].noOfContributors = noOfContributors;
        contractsMapList[address(this)].remainingFunds =
            targetFunds -
            raisedFunds;
    }

    function getRaisedFunds() public view returns (uint256) {
        return address(this).balance;
    }

    function getContractOwner() public view returns (address) {
        return campaignCreator;
    }

    function getRemainingFunds() public view returns (uint256) {
        return targetFunds - raisedFunds;
    }

    function getTotalContributors() public view returns (uint256) {
        return noOfContributors;
    }

    function isContibutors(address _address) public view returns (bool) {
        if (contributorsList[_address] > 0) {
            return true;
        } else {
            return false;
        }
    }

    function getFundsOfContributor(
        address _address
    ) public view returns (uint256) {
        return contributorsList[_address];
    }

    function withdrawFunds(address _address) public {
        require(isWithdrawOnce == false, "Campaign has closed.");

        require(
            _address == campaignCreator,
            "Only creater can withdraw funds."
        );
        require(raisedFunds > 0, "Not enough balance to withdraw.");
        address payable owner = payable(_address);
        owner.transfer(raisedFunds);
        isWithdrawOnce = true;
    }
}
