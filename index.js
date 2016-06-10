/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

var util = require('util');
var async = require('async');
var msRestAzure = require('ms-rest-azure');
var ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;
var StorageManagementClient = require('azure-arm-storage');

_validateEnvironmentVariables();
var clientId = process.env['CLIENT_ID'];
var domain = process.env['DOMAIN'];
var secret = process.env['APPLICATION_SECRET'];
var subscriptionId = process.env['AZURE_SUBSCRIPTION_ID'];
var resourceClient, storageClient;
//Sample Config
var randomIds = {};
var location = 'westus';
var accType = 'Standard_LRS';
var resourceGroupName = _generateRandomId('testrg', randomIds);
var storageAccountName = _generateRandomId('testacc', randomIds);
var expectedServerFarmId;

  ///////////////////////////////////////////
 //Entrypoint for the storage-sample script/
///////////////////////////////////////////

msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain, function (err, credentials) {
  if (err) return console.log(err);
  resourceClient = new ResourceManagementClient(credentials, subscriptionId);
  storageClient = new StorageManagementClient(credentials, subscriptionId);
  // Work flow of this sample:
  // Setup. Create a resource group 
  // 1. Create a storage account
  // 2. Get all the account properties
  // 3. List all the storage accounts in a resource group
  // 4. List all the storage accounts in a subscription
  // 5. Get the storage account keys for a given storage account
  // 6. Rgenerate account keys for a given storage account
  // 7. Update storage account properties
  // 8. Check if the storage account name is available
  // 9. Get the current usage count and the limit for resources under the current subscription
  
  async.series([
    function (callback) {
      //Setup
      createResourceGroup(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        callback(null, result);
      });
    },
    function (callback) {
      //Task 1
      createStorageAccount(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log('\nThe created storage account result is: \n' + util.inspect(result, { depth: null }));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 2
      getStorageAccount(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log('\n' + util.inspect(result, { depth: null }));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 3
      listStorageAccountsByResourceGroup(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log('\n' + util.inspect(result, { depth: null }));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 4
      listStorageAccounts(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log('\n' + util.inspect(result, { depth: null }));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 5
      listStorageAccountKeys(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log('\n' + util.inspect(result, { depth: null }));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 6
      regenerateStorageAccountKeys(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log('\n' + util.inspect(result, { depth: null }));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 7
      updateStorageAccount(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log('\nUpdated result is:\n' + util.inspect(result, { depth: null }));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 8
      checkNameAvailability(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log('\n' + util.inspect(result, { depth: null }));
        callback(null, result);
      });
    },
    function (callback) {
      //Task 9
      listUsage(function (err, result, request, response) {
        if (err) {
          return callback(err);
        }
        console.log('\n' + util.inspect(result, { depth: null }));
        callback(null, result);
      });
    }
  ], 
  // Once above operations finish, cleanup and exit.
  function (err, results) {
    if (err) {
      console.log(util.format('\n??????Error occurred in one of the operations.\n%s', 
          util.inspect(err, { depth: null })));
    }
    console.log('\n###### Exit ######\n')
    console.log(util.format('Please execute the following script for cleanup:\nnode cleanup.js %s %s', resourceGroupName, storageAccountName));
    process.exit();
  });
});


// Helper functions
function createResourceGroup(callback) {
  var groupParameters = { location: location, tags: { sampletag: 'sampleValue' } };
  console.log('\nCreating resource group: ' + resourceGroupName);
  return resourceClient.resourceGroups.createOrUpdate(resourceGroupName, groupParameters, callback);
}

function createStorageAccount(callback) {
  var createParameters = {
    location: location,
    sku: {
      name: accType,
    },
    kind: 'Storage',
    tags: {
      tag1: 'val1',
      tag2: 'val2'
    }
  };
  console.log('\n-->Creating storage account: ' + storageAccountName + ' with parameters:\n' + util.inspect(createParameters));
  return storageClient.storageAccounts.create(resourceGroupName, storageAccountName, createParameters, callback);
}

function listStorageAccountsByResourceGroup(callback) {
  console.log('\n-->Listing storage accounts in the resourceGroup : ' + resourceGroupName);
  return storageClient.storageAccounts.listByResourceGroup(resourceGroupName, callback);
}

function listStorageAccounts(callback) {
  console.log('\n-->Listing storage accounts in the current subscription.');
  return storageClient.storageAccounts.list(callback);
}

function listStorageAccountKeys(callback) {
  console.log('\n-->Listing storage account keys for account: ' + storageAccountName);
  return storageClient.storageAccounts.listKeys(resourceGroupName, storageAccountName, callback);
}

function regenerateStorageAccountKeys(callback) {
  console.log('\n-->Regenerating storage account keys for account: ' + storageAccountName);
  return storageClient.storageAccounts.regenerateKey(resourceGroupName, storageAccountName, 'key1', callback);
}

function getStorageAccount(callback) {
  console.log('\n-->Getting info of storage account: ' + storageAccountName);
  return storageClient.storageAccounts.getProperties(resourceGroupName, storageAccountName, callback);
}

function updateStorageAccount(callback) {
  var updateParameters = {
    sku: {
      name: 'Standard_GRS'
    }
  };
  console.log('\n-->Updating storage account : ' + storageAccountName + ' with parameters:\n' + util.inspect(updateParameters));
  return storageClient.storageAccounts.update(resourceGroupName, storageAccountName, updateParameters, callback);
}

function checkNameAvailability(callback) {
  console.log('\n-->Checking if the storage account name : ' + storageAccountName + ' is available.');
  return storageClient.storageAccounts.checkNameAvailability(storageAccountName, callback);
}

function listUsage(callback) {
  console.log('\n-->List Usage for Storage Accounts in the current subscription: \n');
  return storageClient.usageOperations.list(callback);
}

function _validateEnvironmentVariables() {
  var envs = [];
  if (!process.env['CLIENT_ID']) envs.push('CLIENT_ID');
  if (!process.env['DOMAIN']) envs.push('DOMAIN');
  if (!process.env['APPLICATION_SECRET']) envs.push('APPLICATION_SECRET');
  if (!process.env['AZURE_SUBSCRIPTION_ID']) envs.push('AZURE_SUBSCRIPTION_ID');
  if (envs.length > 0) {
    throw new Error(util.format('please set/export the following environment variables: %s', envs.toString()));
  }
}

function _generateRandomId(prefix, exsitIds) {
  var newNumber;
  while (true) {
    newNumber = prefix + Math.floor(Math.random() * 10000);
    if (!exsitIds || !(newNumber in exsitIds)) {
      break;
    }
  }
  return newNumber;
}