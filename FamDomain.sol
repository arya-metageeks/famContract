// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FamDomainMintingV1 is Initializable, OwnableUpgradeable {
    IERC20 public paymentToken;
    using SafeERC20 for IERC20;
    
    address payable public feeRecipient;
    uint256 public constant DOMAIN_MINT_FEE = 5 * 10**6; // 5 USDT token

    mapping(string => address) private domains; // Mapping of domain names to owners
    mapping(string => address) public referralOwners; // Mapping of referral codes to referrer addresses
    mapping(address => bool) public hasMintedDomain; // Mapping to track if an address has minted a domain
    mapping(address => bool) public freeMintWhitelist; // Whitelisted users for free mint
    mapping(address => bool) public discountMintWhitelist; // Whitelisted users for discount mint

    event DomainMinted(address indexed user, string domain);
    event ReferralCodeCreated(address indexed referrer, string referralCode);
    event ReferralMinted(
        address indexed user,
        string domain,
        address indexed referrer,
        uint256 fee
    );

    function initialize(
        address _paymentToken,
        address payable _feeRecipient,
        address _initialOwner
    ) public initializer {
        paymentToken = IERC20(_paymentToken);
        feeRecipient = _feeRecipient;

        // Initialize OwnableUpgradeable
        __Ownable_init(_initialOwner);
    }

    // Batch whitelisting for free mint
    function batchAddFreeMintWhitelist(address[] calldata _users)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _users.length; i++) {
            freeMintWhitelist[_users[i]] = true;
        }
    }

    function addFreeMintWhitelist(address _user) external onlyOwner {
        freeMintWhitelist[_user] = true;
    }

    function removeFreeMintWhitelist(address _user) external onlyOwner {
        freeMintWhitelist[_user] = false;
    }

    // Batch whitelisting for discount mint
    function batchAddDiscountMintWhitelist(address[] calldata _users)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _users.length; i++) {
            discountMintWhitelist[_users[i]] = true;
        }
    }

    function addDiscountMintWhitelist(address _user) external onlyOwner {
        discountMintWhitelist[_user] = true;
    }

    function removeDiscountMintWhitelist(address _user) external onlyOwner {
        discountMintWhitelist[_user] = false;
    }

    // Free mint function with whitelisting check
    function freeMintDomain(string memory _domain) external {
        require(domains[_domain] == address(0), "Domain already exists");
        require(
            !hasMintedDomain[msg.sender],
            "You have already minted a domain"
        );
        require(
            freeMintWhitelist[msg.sender],
            "You are not whitelisted for free mint"
        );

        // Mint domain to the sender for free
        domains[_domain] = msg.sender;
        hasMintedDomain[msg.sender] = true;

        emit DomainMinted(msg.sender, _domain);
    }

    // Discount mint function with whitelisting check
    function discountMintDomain(string memory _domain) external {
        require(domains[_domain] == address(0), "Domain already exists");
        require(
            !hasMintedDomain[msg.sender],
            "You have already minted a domain"
        );
        require(
            discountMintWhitelist[msg.sender],
            "You are not whitelisted for discount mint"
        );

       // Transfer 50% of the minting fee
        uint256 discountFee = DOMAIN_MINT_FEE / 2;
        require(paymentToken.allowance(msg.sender, address(this)) >= discountFee, "Insufficient allowance");
        paymentToken.safeTransferFrom(msg.sender, feeRecipient, discountFee);

        // Mint domain to the sender
        domains[_domain] = msg.sender;
        hasMintedDomain[msg.sender] = true;

        emit DomainMinted(msg.sender, _domain);
    }

    // Mint with a referral code where referrer earns 50% of the minting fee
    function mintDomainWithReferral(
        string memory _domain,
        string memory _referralCode
    ) external {
        require(domains[_domain] == address(0), "Domain already exists");
        require(
            !hasMintedDomain[msg.sender],
            "You have already minted a domain"
        );
        require(
            referralOwners[_referralCode] != address(0),
            "Invalid referral code"
        );

        address referrer = referralOwners[_referralCode];

        // Transfer the full minting fee from the user
        require(
            paymentToken.allowance(msg.sender, address(this)) >=
                DOMAIN_MINT_FEE,
            "Insufficient allowance"
        );
            paymentToken.safeTransferFrom(
                msg.sender,
                address(this),
                DOMAIN_MINT_FEE
        
           
        );

        // Split the minting fee: 50% to referrer, 50% to feeRecipient
        uint256 referrerCut = DOMAIN_MINT_FEE / 2;
        uint256 recipientCut = DOMAIN_MINT_FEE - referrerCut;

            paymentToken.safeTransfer(referrer, referrerCut);
            paymentToken.safeTransfer(feeRecipient, recipientCut);
           
      

        // Mint the domain to the sender
        domains[_domain] = msg.sender;
        hasMintedDomain[msg.sender] = true;

        emit ReferralMinted(msg.sender, _domain, referrer, referrerCut);
    }

    // Allow user to create their own referral code after minting a domain
    function createReferralCode(string memory _referralCode) external {
        require(hasMintedDomain[msg.sender], "You must mint a domain first");
        require(
            referralOwners[_referralCode] == address(0),
            "Referral code already exists"
        );

        // Register the referral code under the user's address
        referralOwners[_referralCode] = msg.sender;

        emit ReferralCodeCreated(msg.sender, _referralCode);
    }

    // View function to check domain ownership
    function getDomainOwner(string memory _domain)
        external
        view
        returns (address)
    {
        return domains[_domain];
    }

    // Update recipient and payment token
    function updateFeeRecipient(address payable _newRecipient)
        external
        onlyOwner
    {
        feeRecipient = _newRecipient;
    }
}