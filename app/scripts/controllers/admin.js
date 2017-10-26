'use strict';

/**
 * @ngdoc function
 * @name easterdashApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the easterdashApp
 * {name: 'Team #A', description: 'Doing some awesome stuff an\' that!', balance:123},
 * {name: 'Team #2', description: 'Doing some awesome stuff an\' that!', balance:231},
 * {name: 'Team #III', description: 'Doing some awesome stuff an\' that!', balance:213},
 * {name: 'Team #Ω', description: 'Doing some awesome stuff an\' that!', balance:312}
 */
angular.module('easterdashApp').controller('AdminCtrl', ['$scope', 'teamDb', 'ngToast', '$http', function ($scope, teamDb, ngToast, $http) {
    var saveTransaction = function(title, delta, teamName) {
        var transaction;
        if (document.getElementById('task-payout').value.length > 0) {
          delta = document.getElementById('task-payout').value;
        } else {
          delta = delta || 0;
        }
        transaction = {
            time: new Date().getTime(),
            title: title,
            delta: delta
        };

        teamDb.get('teams').then(function(res) {
            res.data.some(function(stored) {
                if (stored.name === teamName) {
                    stored.balance = parseFloat(stored.balance) + parseFloat(delta);
                    transaction.balance = stored.balance;
                    stored.transactions.push(transaction);
                    return true;
                }
            });

            teamDb.put(res);
            $scope.teams = res.data;
        });
    };

    $scope.addTeam = function(team) {
        team.balance = team.balance || 0;
        team.transactions = [{
            time: new Date().getTime(),
            title: 'Initial Investment',
            delta: 0,
            balance: team.balance
        }];
        teamDb.get('teams').then(function(res) {
            res.data.push(team);
            teamDb.put(res);
            $scope.teams = res.data;
            ngToast.create({className: 'success', content: 'Team added.'});
        }).catch(function() {
            teamDb.put({
                _id: 'teams',
                data: [team]
            });
            $scope.teams = [team];
            ngToast.create({className: 'success', content: 'Team added.'});
        });

        $scope.newTeam = {
            balance: '',
            description: '',
            name: ''
        };
    };

    teamDb.get('teams').then(function(res) {
        $scope.teams = res.data;
    }).catch(function() {
        $scope.teams = [];
    });

    $scope.saveCost = function(costIncurred) {
      if (costIncurred.secret === 'secret'){
        saveTransaction(costIncurred.description, -1 * costIncurred.value, costIncurred.team.name);
        ngToast.create({className: 'success', content: 'Cost saved.'});
        $scope.costIncurred = {value: '', description: ''};
      } else {
        ngToast.create({className: 'danger', content: 'Incorect secret.'});
      }
    };
    $scope.savePayout = function(taskDetails) {
        if (taskDetails.secret === 'secret'){
          saveTransaction(taskDetails.description, taskDetails.value, taskDetails.team.name);
          ngToast.create({className: 'success', content: 'Payment saved.'});
          $scope.taskCompleted = {value: '', description: ''};
        } else {
          ngToast.create({className: 'danger', content: 'Incorect secret.'});
        }
    };

    $http({
      method: 'GET',
      url: 'http://localhost:9000/stories.json'
    }).then(function(resp) {
      $scope.stories = resp.data;
    });

    $scope.updatePayout = function(){
      var storyID = 's' + $scope.taskCompleted.description.substr(6);

      for (var i = 0; i < $scope.stories.length; i++) {
        if ($scope.stories[i].id === storyID) {
          document.getElementById('task-payout').value = $scope.stories[i].value;
        }
      }
    };
}]);
