pragma solidity ^0.4.18;

import "./ownership/Ownable.sol";

contract DataStore is Ownable{

  /**** Storage Types *******/

    mapping(bytes32 => uint256)    private mUIntStorage;
    mapping(bytes32 => string)     private mStringStorage;
    mapping(bytes32 => address)    private mAddressStorage;
    mapping(bytes32 => bytes)      private mBytesStorage;
    mapping(bytes32 => bool)       private mBooleanStorage;
    mapping(bytes32 => int256)     private mIntStorage;

    modifier onlyLatest() {
        // The owner is only allowed to set the storage upon deployment to register the initial contracts, afterwards their direct access is disabled
        if (msg.sender == owner)
        {
            require(mBooleanStorage[keccak256("contract.storage.initialised")] == false);
        }
        else
        {
            // Make sure the access is permitted to only contracts in our Dapp
            require(mAddressStorage[keccak256("contract.address", msg.sender)] != 0x0);
        }
        _;
    }


    /**** Get Methods ***********/

    /// @param _key The key for the record
    function getAddress(bytes32 _key) external view returns (address) {
        return mAddressStorage[_key];
    }

    /// @param _key The key for the record
    function getUint(bytes32 _key) external view returns (uint) {
        return mUIntStorage[_key];
    }

    /// @param _key The key for the record
    function getString(bytes32 _key) external view returns (string) {
        return mStringStorage[_key];
    }

    /// @param _key The key for the record
    function getBytes(bytes32 _key) external view returns (bytes) {
        return mBytesStorage[_key];
    }

    /// @param _key The key for the record
    function getBool(bytes32 _key) external view returns (bool) {
        return mBooleanStorage[_key];
    }

    /// @param _key The key for the record
    function getInt(bytes32 _key) external view returns (int) {
        return mIntStorage[_key];
    }

    /**** Set Methods ***********/

  /// @param _key The key for the record
  function setAddress(bytes32 _key, address _value) onlyLatest external {
      mAddressStorage[_key] = _value;
  }

  /// @param _key The key for the record
  function setUint(bytes32 _key, uint _value) onlyLatest external {
      mUIntStorage[_key] = _value;
  }

  /// @param _key The key for the record
  function setString(bytes32 _key, string _value) onlyLatest external {
      mStringStorage[_key] = _value;
  }

  /// @param _key The key for the record
  function setBytes(bytes32 _key, bytes _value) onlyLatest external {
      mBytesStorage[_key] = _value;
  }

  /// @param _key The key for the record
  function setBool(bytes32 _key, bool _value) onlyLatest external {
      mBooleanStorage[_key] = _value;
  }

  /// @param _key The key for the record
  function setInt(bytes32 _key, int _value) onlyLatest external {
      mIntStorage[_key] = _value;
  }

  /**** Delete Methods ***********/

  /// @param _key The key for the record
  function deleteAddress(bytes32 _key) onlyLatest external {
      delete mAddressStorage[_key];
  }

  /// @param _key The key for the record
  function deleteUint(bytes32 _key) onlyLatest external {
      delete mUIntStorage[_key];
  }

  /// @param _key The key for the record
  function deleteString(bytes32 _key) onlyLatest external {
      delete mStringStorage[_key];
  }

  /// @param _key The key for the record
  function deleteBytes(bytes32 _key) onlyLatest external {
      delete mBytesStorage[_key];
  }

  /// @param _key The key for the record
  function deleteBool(bytes32 _key) onlyLatest external {
      delete mBooleanStorage[_key];
  }

  /// @param _key The key for the record
  function deleteInt(bytes32 _key) onlyLatest external {
      delete mIntStorage[_key];
  }

}
