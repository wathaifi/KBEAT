define(['jquery', 'angular', 'angular-i18n', 'angular-ui-router', 'underscore',
    'angular-animate', 'angular-aria', 'angular-messages', 'angular-cookies',
    'angular-translate-loader', 'angular-moment', 'angular-translate-storage-cookie', 'angular-translate-storage-local',
    'angular-material', 'angular-loading-bar', 'md-steppers', 'angular-material-data-table', 'angular-scroll','bootstrap', 'fabricjs', 'nvd3'
  ],

  function($, angular) {

    angular.module('keec', [
        'angular-loading-bar', 'ui.router', 'ngMaterial', 'pascalprecht.translate', 'ngCookies', 'md-steppers', 'md.data.table',
        'duScroll', 'angularMoment', 'nvd3', 'ngAnimate'
      ])

      .config(function($locationProvider, $stateProvider, $urlRouterProvider, $translateProvider, $mdAriaProvider, cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = true; // Show the spinner.
        cfpLoadingBarProvider.includeBar = true; // Show the bar.
        //disabling Aria
        $mdAriaProvider.disableWarnings();
        // Multi-language support
        $translateProvider
          .useLocalStorage()
          .useStaticFilesLoader({
            prefix: '/kbeat/assets/locales/',
            suffix: '.json'
          })
          .determinePreferredLanguage(function() {
            var lang = navigator.language || navigator.userLanguage;
            return lang && lang.substring(0, 2);
          });
        $translateProvider.useSanitizeValueStrategy('escape');

        // Enabling HTML 5 mode to remove the # prefix from URL's
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        });
        
        // URL States (routes)
        $stateProvider

          /* Intro Page */
          .state('app.intro', {
            url: '/kbeat/',
            views: {
              'content@': {
                templateUrl: '/kbeat/assets/views/intro.html',
                controller: function($scope, $rootScope, $window) {
                  
                  $rootScope.footer = true;
                }
              }
            }
          })

          .state('app', {
            abstract: true,
            url: '',
            resolve: {
              // Gets app configuration
              config: function($http) {
                return $http.get('/kbeat/api/config').then(function(response) {
                  return response.data;
                });
              },

              //Get model - By Anup Kumar -
              models: function($http, $rootScope, $translate, $sce) {
                var locale = $translate.use() || $translate.proposedLanguage();
                return $http.get('/kbeat/api/models', {
                  params: {
                    locale: locale
                  }
                }).then(function(response) {
                  var models = response.data['objects'] || [];
                  $rootScope.models = models
                  return $rootScope.models;
                });
              },

              //Gets tasks
              tasks: function($http, $rootScope, models) {
                return $http.get('/kbeat/api/tasks').then(function(response) {
                  var tasks = response.data['tasks'] || [];
                  var paginationLimit = 10;
                  _(tasks).each(function (task) {
                    if (!task.model_name) {
                      task.model_name = _(models).findWhere({name: task['model_name'].lower()});
                    }
                    paginationLimit = task.model_name.taskPaginationLimit;
                  });
                  $rootScope.filteredTasks = tasks;
                  $rootScope.tasks = tasks;
                  $rootScope.taskPagination = {
                    limit: paginationLimit,
                    pages: Math.floor($rootScope.filteredTasks.length / paginationLimit) + ($rootScope.filteredTasks.length % paginationLimit ? 1 : 0),
                    currentPage: 1,
                    start: 0
                  }
                  $rootScope.showMoreButton=true;
                  $rootScope.taskPagination.pages =  Math.floor($rootScope.tasks.length / 6) + 1;
                  $rootScope.taskPagination.start = 0;
                  $rootScope.calculatePagination = function(){
                      $rootScope.taskPagination = {
                        limit: paginationLimit,
                        pages: Math.floor($rootScope.filteredTasks.length / paginationLimit) + ($rootScope.filteredTasks.length % paginationLimit ? 1 : 0),
                        currentPage: 1,
                        start: 0
                      }
                  }
                  $rootScope.taskPagination = {
                    limit: paginationLimit,
                    pages: Math.floor($rootScope.filteredTasks.length / paginationLimit) + ($rootScope.filteredTasks.length % paginationLimit ? 1 : 0),
                    currentPage: 1,
                    start: 0
                  }
                  $rootScope.taskPaginate = function(direction)
                  {
                    switch(direction)
                    {
                      case 'next':
                        if($rootScope.taskPagination.currentPage+1 <= $rootScope.taskPagination.pages)
                          $rootScope.taskPagination.currentPage += 1;
                          break;
                      case 'prev':
                        if($rootScope.taskPagination.currentPage-1 >= 1)
                          $rootScope.taskPagination.currentPage -= 1;
                        break;
                    }
                    $rootScope.taskPagination.start = ($rootScope.taskPagination.currentPage -1) * $rootScope.taskPagination.limit;
                  }
                  return $rootScope.tasks;
                });
              },

              //Get Task ID
              task_id: function($location, $rootScope){
                $rootScope.task_id = $location.path().substr($location.path().lastIndexOf('/') + 1);
                return $rootScope.task_id;
              }
            },
            views: {
              'header': {
                templateUrl: '/kbeat/assets/views/header.html',
                controller: function($scope,$rootScope){
                  $("#helpBtn").click(function(){
                    $("#help").modal();
                  });
                }
              },
              'footer': {
                templateUrl: '/kbeat/assets/views/footer.html'
              },
            }
          })

          /* Home */
          .state('app.home', {
            url: '/kbeat/model/{model_name}',
            resolve: {
              model: function($stateParams, models) {
                return _(models).findWhere({
                  name: $stateParams['model_name']
                });
              }
            },
            views: {
              'content@': {
                templateUrl: '/kbeat/assets/views/home.html',
                controller: function($scope, $rootScope, $mdDialog, api, model, $location, $anchorScroll, $document, $window) {
                  $('body').on({
                      'mousewheel': function(e) {
                          if (e.target.id == 'el') return;
                          // e.preventDefault();
                          e.stopPropagation();
                      }
                  })
                  var ar=new Array(33,34,35,36,37,38,39,40);
                  $('body').keydown(function(e) {
                      var key = e.which;
                        if($.inArray(key,ar) > -1) {
                            e.preventDefault();
                            return false;
                        }
                        return true;
                  });
                  $('#loadingOverlay').hide()
                  if ($window.localStorage.getItem("token") == null) {
                    $rootScope.selectedCountry = 0;
                  } else {
                    $rootScope.selectedCountry = $window.localStorage.getItem("token");
                  }
                  $rootScope.footer = false;
                  $rootScope.onClick = function(index) {
                    $window.localStorage.setItem("token", index);
                  };
                  $rootScope.model = model;
                  $scope.count = 0;
                  $scope.activeStepIndex = 0;
                  $scope.totalSteps = $rootScope.model.steps.length;
                  $scope.activateStep = function(index) {
                    if ((index <= $scope.count)) {
                      $scope.activeStepIndex = index;
                      $("html, body").stop(true).delay(10).animate({
                        scrollTop: $('#' + index).offset().top - ($("#stppr").outerHeight() + 50)
                      }, 1500);
                    }
                  };

                  $rootScope.postData = function(data) {
                    $window.scrollTo(0, angular.element('loadingOverlay').offsetTop);
                    $('#loadingOverlay').show()
                    api.postData(model.name, data);
                  };

                  $rootScope.num = 0;

                  $rootScope.stepNext = function(index) {
                    if (index == 5) {
                      $scope.activeStepIndex = index;
                      $rootScope.data = {};
                      var resJson = {}
                      var ObjCount = 0;
                      var RelDimId;
                      $rootScope.model.steps.forEach(function(obj) {
                        obj.containers.forEach(function(obj1) {
                          obj1.parameters.forEach(function(obj2) {
                            if (obj2.id != 'prev' && obj2.id != 'next' && obj2.id != 'figure' && obj2.id != 'run' && obj2.id != 'display' && obj2.type != 'table' && obj2.id != 'shape') {
                              if (obj2.id == 'cmbBldgShape') {
                                RelDimId = obj2.value;
                              }
                              // console.log(obj2.id);
                              if (typeof RelDimId != "undefined" && obj2.id == RelDimId) {
                                if(RelDimId == 'Rectangular'){
                                  resJson['txtFloorArea'] = obj2.value['X1'] * obj2.value['Y1']
                                  ObjCount = ObjCount + 2;
                                }else if(RelDimId == 'L-Shape'){
                                  resJson['txtFloorArea'] = (obj2.value['X1'] * obj2.value['Y2']) + ((obj2.value['Y1'] - obj2.value['Y2']) * obj2.value['X2'])
                                  ObjCount = ObjCount + 2;
                                }else if(RelDimId == 'T-Shape'){
                                  resJson['txtFloorArea'] =  ((obj2.value['X1'] * obj2.value['Y1']) - (obj2.value['X2'] * obj2.value['Y2']) - ((obj2.value['X1'] - obj2.value['X2'] - obj2.value['X3']) * obj2.value['Y2']))
                                  ObjCount = ObjCount + 2;
                                }else if(RelDimId == 'U-Shape'){
                                  resJson['txtFloorArea'] = (obj2.value['Y1'] >= obj2.value['Y2']) ? obj2.value['X1'] * obj2.value['Y1'] - (obj2.value['X1'] - obj2.value['X2'] - obj2.value['X3']) * (obj2.value['Y1'] - obj2.value['Y3']) - obj2.value['X3'] * (obj2.value['Y1'] - obj2.value['Y2']) : obj2.value['X1'] * obj2.value['Y2'] - (obj2.value['X1'] - obj2.value['X2'] - obj2.value['X3']) * (obj2.value['Y2'] - obj2.value['Y3']) - obj2.value['X2'] * (obj2.value['Y2'] - obj2.value['Y1'])
                                  ObjCount = ObjCount + 2;
                                }else{
                                  resJson['txtFloorArea'] = obj2.value['X1'] * obj2.value['Y1']
                                  ObjCount = ObjCount + 2;
                                }
                                for (var key in obj2.value) {
                                  if (key == "Building Orientation"){
                                    resJson['txtBldgAzi'] = (typeof obj2.value[key] != 'undefined') ? obj2.value[key] : 0
                                  }else {
                                    resJson['txtLeng' + key] = obj2.value[key];
                                    ObjCount = ObjCount + 2;
                                  }
                                }
                              }
                              if (obj2.id == 'rdbtnWinWwr') {
                                if (obj2.rdbtnWinArea) {
                                  resJson.rdbtnWinArea = obj2.rdbtnWinArea;
                                  ObjCount = ObjCount + 2;
                                } else if (obj2.rdbtnWinWwr) {
                                  resJson.rdbtnWinWwr = obj2.rdbtnWinWwr;
                                  ObjCount = ObjCount + 2;
                                }
                              } else {
                                resJson[obj2.id] = obj2.value;
                                ObjCount = ObjCount + 2;
                              }
                            }
                          });
                        });
                      });
                      resJson.txtSkyltType = 'flat';
                      resJson.txtSkyltCvr = 13;
                      resJson.cmbHotWaterSystem = 'Tankless electric DHW system';
                      var nonObjJson = {};
                      for (var prop in resJson) {
                        if (resJson.hasOwnProperty(prop) && typeof resJson[prop] !== "object") {
                          nonObjJson[prop] = resJson[prop];
                        }
                      }
                      $rootScope.data = JSON.stringify(nonObjJson);
                      $rootScope.postData($rootScope.data);
                    } else {
                      var isError = false;
                      $rootScope.model.steps[$scope.activeStepIndex].containers.forEach(function(container) {
                        container.parameters.forEach(function(parameter) {
                          parameter.error = false;
                          // parameter.dimError = false;
                          // if((parameter.id = parameter.value) && (parameter.related_id = 'cmbBldgShape')){
                          //   if((parameter.value['X2'] >= parameter.value['X1']) || (parameter.value['X3'] >= parameter.value['X1']) || ((parameter.value['X2'] + parameter.value['X3']) >= parameter.value['X1']) || (parameter.value['Y2'] >= parameter.value['Y1'])){
                          //     parameter.dimError = true
                          //     isError = true;
                          //   }
                          // }
                          if ((parameter.type != 'shape') && (parameter.type != 'button') && (parameter.type != 'table') && (parameter.type != 'figure') && (parameter.value === null || parameter.value === "")) {
                            parameter.error = true;
                            isError = true;
                          }
                        });
                      });
                    }

                    if (index <= 4 && isError == false) {
                      $scope.activeStepIndex = index;
                      if (index - 1 == $scope.count) {
                        $scope.count += 1;
                      }
                      $("html, body").stop(true).delay(10).animate({
                        scrollTop: $('#' + index).offset().top - ($("#stppr").outerHeight() + 50)
                      }, 1500);
                    }
                  };

                  $rootScope.stepBack = function(index) {
                    $scope.activeStepIndex = index
                    $("html, body").stop(true).delay(10).animate({
                      scrollTop: $('#' + index).offset().top - ($("#stppr").outerHeight() + 50)
                    }, 1500);
                  };
                  $rootScope.Dialog = function(ev) {
                    $mdDialog.show({
                        controller: function($scope, $mdDialog) {
                          $scope.conDialog = $rootScope.constructionDialog;
                          $scope.conDialog.options0 = $scope.conDialog.parameters[0].options.split(', ');
                          $scope.conDialog.values0 = $scope.conDialog.parameters[0].values.split(', ');
                          $scope.conDialog.options1 = $scope.conDialog.parameters[1].options.split(', ');
                          $scope.conDialog.values1 = $scope.conDialog.parameters[1].values.split(', ');
                          $scope.conDialog.options4 = $scope.conDialog.parameters[4].options.split(', ');
                          $scope.conDialog.values4 = $scope.conDialog.parameters[4].values.split(', ');
                          $scope.winDialog = $rootScope.windowDialog;
                          $scope.hide = function() {
                            $mdDialog.hide();
                          };
                        },
                        templateUrl: '/kbeat/assets/views/dialog.html',
                        targetEvent: ev,
                        scope: $scope,
                        preserveScope: true,
                        clickOutsideToClose: true
                      }

                    );
                  };
                }
              }
            }
          })

          //Task list page state
          .state('app.tlist', {
            url: '/kbeat/task',
            views: {
              'content@': {
                templateUrl: '/kbeat/assets/views/task-list.html',
                controller: function($scope,$rootScope){
                  $rootScope.footer = true;
                }
            }
            },
            onEnter: function(){
              setTimeout(window.createCarousel,500);
            }
          })

          //Task Result
          .state('app.taskResult', {
            url: '/kbeat/task/{task_id}',
            resolve: {
              task: function($stateParams, $http, tasks, $rootScope) {
                var task = _(tasks).findWhere({id: $stateParams['task_id']});
                return $http.get('/kbeat/api/tasks/' + task.id + '/result').then(function (response) {
                    // console.log(response.data)
                    // var result = response.data;
                    $rootScope.reportResultData = response.data;
                    return response.data;
                });
              }
            },
            views: {
              'content@': {
                templateUrl: '/kbeat/assets/views/task-result.html',
                controller: function ($scope, $window, task, $rootScope) {
                  $rootScope.footer = true;
                  $scope.task = task;
                   $scope.bepuCompareChartOptions = {
                    chart: {
                      type: 'multiBarChart',
                        clipEdge: true,
                        groupSpacing: 0.1,
                        reduceXTicks: false,
                        showControls: false,
                        interactive: true,
                        tooltip: {
                          enabled: false,
                        },
                        height: 300,
                        width: 700,
                        color: (['#5894D0','#F67A40']),
                        margin : {
                            top: 50,
                            right: 30,
                            bottom: 40,
                            left: 80
                        },
                        legend: {
                          rightAlign: true
                        },
                        tooltip: {
                          enabled: false
                        },
                        duration: 500,
                        x: function(d){ return d.label; },
                        y: function(d){ return d.value; },
                        xAxis: {
                            "showMaxMin": false,
                            tickFormat: function(d) {return d;}
                        },
                        yAxis: {
                            "showMaxMin": true,
                            axisLabel: "Annual Energy Use (kWh/year)",
                            axisLabelDistance: 20,
                            tickFormat: function(d){
                              return d3.format(',.f')(d);
                          }
                        },
                        title: {
                          enable: true,
                          text: 'Annual Energy Use (kWh/year)',
                          css: {
                            'textAlign': 'center',
                            'color': 'black'
                          }
                        },
                      }
                   };
                   $scope.bepuComparisonData = task.bepuComparisonData;
                   var months = ["JAN" , "FEB" , "MAR" , "APR" , "MAY", "JUN" , "JUL" , "AUG" , "SEP" , "OCT" , "NOV" , "DEC"];
                   $scope.pseChartOptions = {
                    chart: {
                      type: 'multiBarChart',
                        clipEdge: true,
                        stacked: true,
                        reduceXTicks: false,
                        showControls: false,
                        interactive: true,
                        groupSpacing: 0.1,
                        height: 270,
                        width: 700,
                        color: (['#FFC43E','#A4A4A4','#F67A40','#5894D0']),
                        tooltip: {
                          enabled: false,
                        },
                        margin : {
                            top: 50,
                            right: 30,
                            bottom: 36,
                            left: 90
                        },
                        legend: {
                          rightAlign: true
                        },
                        duration: 500,
                        xAxis: {
                            "showMaxMin": false,
                            tickFormat: function(d) {return months[d];}
                        },
                        yAxis: {
                            "showMaxMin": true,
                            axisLabel: "Electricity Consumption (kWh)",
                            axisLabelDistance: 10,
                            tickFormat: function(d){
                              return d3.format(',.f')(d);
                          }
                        },
                      }
                   };
                   $scope.pseBarData = task.pseBarData;
                   $scope.lvdChart = {
                    chart: {
                      type: 'multiBarChart',
                        clipEdge: true,
                        stacked: false,
                        reduceXTicks: false,
                        showControls: false,
                        interactive: true,
                        groupSpacing: 0.1,
                        tooltip: {
                          enabled: false,
                        },
                        height: 270,
                        width: 700,
                        color: (['#5894D0','#F67A40']),
                        margin : {
                            top: 50,
                            right: 30,
                            bottom: 35,
                            left: 70
                        },
                        legend: {
                          rightAlign: true
                        },
                        duration: 500,
                        x: function(d){ return d.label; },
                        y: function(d){ return d.value; },
                        xAxis: {
                            "showMaxMin": false,
                            tickFormat: function(d) {return d;}
                        },
                        yAxis: {
                            "showMaxMin": true,
                            axisLabel: "Envelope U-value (W/sqm.K)",
                            axisLabelDistance: 10,
                            tickFormat: function(d){
                              return d3.format(',.02f')(d);
                          }
                        },
                      }
                   };
                   $scope.lvdData = task.lvdData;
                   $scope.bepuPieDataOptions = {
                     chart: {
                       type: 'pieChart',
                       showLabels: true,
                       labelThreshold: .05,
                       height: 400,
                       width: 500,
                       color: (['#FFC43E','#A4A4A4','#F67A40','#5894D0', '#98cd99']),
                       margin: {
                          top: 80,
                          // right: 30,
                          bottom: 20,
                          left: 50
                       },
                       labelsOutside: "false",
                       tooltip: {
                          enabled: false,
                        },
                       labelType: "percent", 
                       legend: {
                          rightAlign: true
                        },
                       x: function(d) {return d.label;},
                       y: function(d) {return d.value;},
                       duration: 500
                     }
                   };
                   $scope.bepuPieData = task.bepuPieData;
                }
              }
            },
            onEnter: function ($state,  $stateParams, $rootScope, $timeout, task) {
              if (!task || task.status == 'ERROR') $state.go('app.tlist', {}, {location: 'replace'});
            }
          })
        // If the path doesn't match any of the configured urls redirect to home
        $urlRouterProvider.otherwise('/kbeat/');
      })
      /* Backend API */
      .factory('api', function($q, $http, $state, $timeout, $rootScope, $window, $mdDialog) {
        var request = function(callback, timeout) {
          var deferred = $q.defer();

          $timeout(function() {
            deferred.resolve(null);
          }, typeof timeout !== 'undefined' ? timeout : 800);

          callback(deferred);

          return deferred.promise;
        };

        return {
          postData: postData
        };

        function postData(name, data) {
          return $http.post('/kbeat/api/models/' + name, data).then(function(response) {
            if(response.data.status == 'COMPLETED'){
               $window.location.href = "/kbeat/task/" + response.data.id;
            }else if(response.data.status == 'ERROR') {
              $('#loadingOverlay').hide()
                $mdDialog.show(
                  $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Model Error')
                    .textContent(response.data.errorMsg)
                    .ok('Got it!')
                );
            }
          })
        }
      })

      /* Configuration manager */
      .factory('configStorage', function($window, $cookieStore) {
        return {
          set: function(name, value) {
            try {
              $window.localStorage.setItem(name, value);
            } catch (e) {
              $cookieStore.put(name, value);
            }
          },
          get: function(name) {
            try {
              return $window.localStorage.getItem(name);
            } catch (e) {
              return $cookieStore.get(name);
            }
          }
        }
      })

      //
      // Filters
      //

      .filter('htmlSafe', function($sce){
        return function(args){
          return $sce.trustAsHtml(args);
        }
      })

      .filter('parameterDisplay', function ($sce) {
        var getParameters = function(args){
          // console.log(args);
          var bldLoc = args.cmbBldgLocation;
          var bldShape = args.cmbBldgShape;
          return bldLoc + " | " + bldShape;
        }
        return function (args) {
          return $sce.trustAsHtml(getParameters(args));
        };
      })

      .filter('argumentDisplay', function ($sce) {
        var getParameters = function(args){
          var params = "Building Name: " + args.txtBldgName;
          params += " | " + "Building Type: " +  args.cmbBldgType;
          params += " | " + "Building Location: " + args.cmbBldgLocation
          params += " | " + "Building Shape: " + args.cmbBldgShape;
          return params;
        }
        return function (args) {
          return $sce.trustAsHtml(getParameters(args));
        };
      })

      .filter('titleDisplay', function(){
        return function(title)
        {
          var location = title;
          return location;
        }
      })

      // Return true or a given text if object has items
      .filter('isEmpty', function () {
        return function (items, replaceText) {
          return items && items.length ? false : replaceText || true;
        };
      })

      //RunTime on Tasks List Page
      .filter('runtime', function ($sce) {
        var getTimeInString = function(delta){
          delta = delta/1000;
          var days = Math.floor(delta / 86400);
          delta -= days * 86400;

          // calculate (and subtract) whole hours
          var hours = Math.floor(delta / 3600) % 24;
          delta -= hours * 3600;

          // calculate (and subtract) whole minutes
          var minutes = Math.floor(delta / 60) % 60;
          delta -= minutes * 60;

          // what's left is seconds
          var seconds = delta % 60;
          var time = "";
          if (days > 0)
          {
            time = time + days + " days "
          }
          if (hours > 0)
          {
            time = time + hours + " hours "
          }
          if (minutes > 0)
          {
            time = time + minutes + " minutes "
          }
          if (seconds > 0)
          {
            seconds = Math.round(seconds, 0)
            time = time + seconds + " seconds "
          }
          return time;

        }
        return function (task) {
          var startTime = +new Date(task.startTime);
          var endTime = +new Date(task.endTime);
          return $sce.trustAsHtml( getTimeInString(endTime - startTime));
        };
      })

      .directive('field', function($mdDialog, $rootScope, $mdEditDialog) {
        return {
          restrict: 'E',
          replace: true,
          scope: {
            field: '=',
            container: '=',
          },
          template: '<div ng-include="getTemplateUrl()"></div>',
          transclude: false,

          link: function(scope, element, attrs) {
            scope.field.type = scope.field.type || 'text';
            scope.field.value = null;
            scope.getTemplateUrl = function() {
              return '/kbeat/assets/views/fields/' + scope.field.type + '.html';
            };
            
            scope.blocked = function() {
              if (scope.field.enabled == 'False') {
                return true;
              }
              return false;
            }

            scope.editInput = function(event, value, index) {
              var editDialog = {
                modelValue: value[index],
                placeholder: 'Enter Input',
                save: function(input) {
                  value[index] = input.$modelValue;
                },
                targetEvent: event,
                title: 'Edit Field',
                validators: {
                  'md-maxlength': 30
                }
              };
              var promise;
              promise = $mdEditDialog.large(editDialog);
            };
            scope.editInputValue = function(event, value) {
              var editDialog = {
                modelValue: value.fieldValue,
                placeholder: 'Enter Value',
                save: function(input) {
                  value.fieldValue = input.$modelValue;
                },
                targetEvent: event,
                title: 'Edit Value',
                validators: {
                  'md-maxlength': 30
                }
              };
              var promise;
              promise = $mdEditDialog.large(editDialog);
            };
            scope.selectedTableRow = null;
            scope.selectRow = function(index) {
              scope.selectedTableRow = index;
            }
            switch (scope.field.type) {
              case 'dropdown':
                scope.field.options = scope.field.options.split(', ');
                scope.field.values = scope.field.values.split(', ');

                if (scope.field.url) {
                  scope.field.urls = scope.field.url.split(', ');
                  scope.field.value = scope.field.values[0];
                }
                scope.$watch('field.url', function() {
                  if (scope.field.url && !scope.field.hover) {
                    scope.field.value = scope.field.url.slice(0, -4);
                  }
                })
                scope.$watch('field.value', function(){
                  if(scope.field.id == 'cmbBldgType'){
                    scope.field.cmbBldgTypeVal = scope.field.value;
                  }
                })
                break;
              case 'radio':
                scope.field.options = scope.field.options.split(', ');
                scope.field.value = scope.field.options[0];
                if (scope.field.url) {
                  scope.field.url = scope.field.url
                }
                scope.$watch('scope.field.value', function() {
                  if (scope.field.value == 'Window Area (m2)') {
                    scope.field.rdbtnWinArea = true;
                    scope.field.rdbtnWinWwr = false;
                  } else {
                    scope.field.rdbtnWinWwr = true;
                  }
                });
                break;
              case 'number':
                scope.field.value = parseFloat(scope.field.default);
                scope.buildType =  scope.container.parameters.filter(function(p) {
                  return p.id == scope.field.related_id;
                })[0];
                break;
              case 'table':
                if (scope.field.id == 'windowTable') {
                  scope.row1 = scope.container.parameters.filter(function(p) {
                    return p.id == scope.field.related_id1;
                  })[0];
                  scope.row1.directionOptions = scope.row1.directionOptions.split(', ');
                  scope.row1.directionValues = scope.row1.directionValues.split(', ');
                  scope.row1.glazingOptions = scope.row1.glazingOptions.split(', ');
                  scope.row1.glazingValues = scope.row1.glazingValues.split(', ');
                  scope.row2 = scope.container.parameters.filter(function(p) {
                    return p.id == scope.field.related_id2;
                  })[0];
                  scope.row2.directionOptions = scope.row2.directionOptions.split(', ');
                  scope.row2.directionValues = scope.row2.directionValues.split(', ');
                  scope.row2.glazingOptions = scope.row2.glazingOptions.split(', ');
                  scope.row2.glazingValues = scope.row2.glazingValues.split(', ');
                  scope.row3 = scope.container.parameters.filter(function(p) {
                    return p.id == scope.field.related_id3;
                  })[0];
                  scope.row3.directionOptions = scope.row3.directionOptions.split(', ');
                  scope.row3.directionValues = scope.row3.directionValues.split(', ');
                  scope.row3.glazingOptions = scope.row3.glazingOptions.split(', ');
                  scope.row3.glazingValues = scope.row3.glazingValues.split(', ');
                  scope.row4 = scope.container.parameters.filter(function(p) {
                    return p.id == scope.field.related_id4;
                  })[0];
                  scope.row4.directionOptions = scope.row4.directionOptions.split(', ');
                  scope.row4.directionValues = scope.row4.directionValues.split(', ');
                  scope.row4.glazingOptions = scope.row4.glazingOptions.split(', ');
                  scope.row4.glazingValues = scope.row4.glazingValues.split(', ');
                  scope.field.rowValues = [];
                  scope.field.rowValues.splice(0, 0, scope.row1, scope.row2, scope.row3, scope.row4);
                } else if (scope.field.id.substr(scope.field.id.length - 6) == 'SpcTbl') {
                  scope.field.row_heading = scope.field.row_heading.split(', ');
                  scope.field.column_heading = scope.field.column_heading.split(', ');
                  scope.field.tblData = [];
                  for (var j=0; j<Object.keys(scope.field.row_heading).length;j++) {
                    scope.field['row'+(j+1)] = scope.field['row'+(j+1)].split(', ');
                    scope.field['row'+(j+1)].splice(0, 0, scope.field.row_heading[j]);
                    scope.field.tblData.push(scope.field['row'+(j+1)])
                  }
                }
                scope.buildType = $rootScope.model.steps[0].containers[1].parameters.filter(function(p) {
                  return p.id == scope.field.related_id;
                })[0];
                break;
              case 'dimension':
              scope.axisObj = {};
                function axisData() {
                  var shpAxisArr = scope.field.label.split(',');
                  for (var axisKey of shpAxisArr) {
                    if(scope.field.hasOwnProperty('txtLeng' + axisKey)) {
                      scope.axisObj[axisKey] = Number(scope.field['txtLeng' + axisKey])
                    }
                  }
                };
                axisData();
                //Watch
                scope.$watchCollection(
                  "axisObj", function() {
                    scope.txtFloorArea = 1;
                    for(var axisKey in scope.axisObj) {
                      if (axisKey != 'Building Orientation'){
                        if(scope.field.id == 'Rectangular'){
                          scope.txtFloorArea *= scope.axisObj[axisKey]
                        }else if(scope.field.id == 'L-Shape'){
                          if(scope.axisObj['X2'] >= scope.axisObj['X1']){
                            $mdDialog.show(
                              $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Error: X2 should be less than the X1')
                                .ok('Got it!')
                            );
                            scope.axisObj['X2'] = scope.axisObj['X1'] - 1
                            return false;
                          }
                          if(scope.axisObj['Y2'] >= scope.axisObj['Y1']){
                            $mdDialog.show(
                              $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Error: Y2 should be less than the Y1')
                                .ok('Got it!')
                            );
                            scope.axisObj['Y2'] = scope.axisObj['Y1'] - 1
                            return false;
                          }
                          scope.txtFloorArea = (scope.axisObj['X1'] * scope.axisObj['Y1']) - ((scope.axisObj['X1'] - scope.axisObj['X2']) * (scope.axisObj['Y1'] - scope.axisObj['Y2']))
                        }else if(scope.field.id == 'T-Shape'){
                          if((scope.axisObj['X2'] + scope.axisObj['X3']) >= scope.axisObj['X1']){
                            $mdDialog.show(
                              $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Error: Sum of X2 and X3 should be less than the X1')
                                .ok('Got it!')
                            );
                            scope.axisObj['X2'] = (scope.axisObj['X1'] / 2) - 1
                            scope.axisObj['X3'] = (scope.axisObj['X1'] / 2) - 1
                            return false;
                          }
                          if(scope.axisObj['Y2'] >= scope.axisObj['Y1']){
                            $mdDialog.show(
                              $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Error: Y2 should be less than the Y1')
                                .ok('Got it!')
                            );
                            scope.axisObj['Y2'] = scope.axisObj['Y1'] - 1
                            return false;
                          }
                          scope.txtFloorArea =  ((scope.axisObj['X1'] * scope.axisObj['Y1']) - (scope.axisObj['X2'] * scope.axisObj['Y2']) - ((scope.axisObj['X1'] - scope.axisObj['X2'] - scope.axisObj['X3']) * scope.axisObj['Y2']))
                        }else if(scope.field.id == 'U-Shape'){
                          scope.txtFloorArea = (scope.axisObj['Y1'] >= scope.axisObj['Y2']) ? scope.axisObj['X1'] * scope.axisObj['Y1'] - (scope.axisObj['X1'] - scope.axisObj['X2'] - scope.axisObj['X3']) * (scope.axisObj['Y1'] - scope.axisObj['Y3']) - scope.axisObj['X3'] * (scope.axisObj['Y1'] - scope.axisObj['Y2']) : scope.axisObj['X1'] * scope.axisObj['Y2'] - (scope.axisObj['X1'] - scope.axisObj['X2'] - scope.axisObj['X3']) * (scope.axisObj['Y2'] - scope.axisObj['Y3']) - scope.axisObj['X2'] * (scope.axisObj['Y2'] - scope.axisObj['Y1'])
                        }else{
                          scope.txtFloorArea *= scope.axisObj[axisKey]
                        }
                      }
                      else if (axisKey == 'Building Orientation'){
                        scope.axisObj['Building Orientation'] = (scope.axisObj['Building Orientation'] > 360) ? 360 : (typeof scope.axisObj['Building Orientation'] == 'undefined') ? 0 : scope.axisObj['Building Orientation']
                      }
                    };
                       scope.field.value = scope.axisObj;
                  }
                );
                scope.building = scope.container.parameters.filter(function(p) {
                  return p.id == scope.field.related_id;
                })[0];
                break;
              case 'shape':
                scope.shape = scope.container.parameters.filter(function(p) {
                  return p.id == scope.field.related_id;
                })[0];
                break;
              case 'button':
                scope.previous = function() {
                  $rootScope.stepBack();
                }

                scope.next = function() {
                  $rootScope.stepNext();
                }
                scope.run = function() {
                  scope.runData();
                  $rootScope.stepNext();
                }
                break;
            }
            scope.dialogBox = function(ev) {
              $rootScope.Dialog(ev);
            }
            if (scope.field.type == 'text' || scope.field.type == 'number' || scope.field.type == 'dimension' )
              scope.$watch('field.value', function(newValue, oldValue) {
                if (scope.field.error && newValue != oldValue) {
                  scope.field.error = !newValue;
                }
                if(typeof scope.field.value === 'undefined'){
                  scope.field.value = Number(scope.field.max);
                }
              });
          }
        }
      });

    angular.element(document).ready(function() {
      angular.bootstrap(document, ['keec']);
    });
  });
