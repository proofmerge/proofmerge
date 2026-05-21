export const proofMergeBadgeAbi = [
  {
    type: "constructor",
    inputs: [{ name: "initialOwner", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "authorizeMinter",
    inputs: [{ name: "minter", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "id", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllBadgeIds",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getBadgeName",
    inputs: [{ name: "badgeId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasBadge",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mintBadge",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "badgeId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "minters",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "revokeMinter",
    inputs: [{ name: "minter", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setURI",
    inputs: [{ name: "newBaseUri", type: "string", internalType: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BadgeMinted",
    inputs: [
      { name: "to", type: "address", indexed: true, internalType: "address" },
      { name: "badgeId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "badgeName", type: "string", indexed: false, internalType: "string" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MinterAuthorized",
    inputs: [
      { name: "minter", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MinterRevoked",
    inputs: [
      { name: "minter", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
] as const;
