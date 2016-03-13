(function (angular) {
	"use strict";

	angular.module("ngDynamicColumns").factory("dynamicColumnService", ['$compile', function ($compile) {

		function createScopedAttrs(options) {
			var key, attrString = "";

			if (options.scopedAttrs) {
				for (key in options.scopedAttrs) {
					if (options.scopedAttrs.hasOwnProperty(key)) {
						attrString = attrString+ ' ' + key + '="' + options.scopedAttrs[key] + '"';
					}
				}
			}

			return attrString;
		}

		function getTh(options) {
			var elemenString = '<table><tr><th data-col-id="' + options.id + '"' + options.directive + ' class="' + options.clazz + '"';

			elemenString = elemenString + createScopedAttrs(options) + '></th></tr></table>';

			return elemenString;
		}

		function getTd(options) {
			var elementString = '<table><tr><td data-col-id="' + options.id + '"' + options.directive + ' class="' + options.clazz + '"';

			elementString = elementString + createScopedAttrs(options) + '></td></tr></table>';

			return elementString;
		}

		function createElement(elementName, options) {
			var element;

			if (elementName === "th") {
				element = getTh(options);
			} else if (elementName === "td") {
				element = getTd(options);
			}

			return angular.element(element).find(elementName);
		}

		function render(scope, element, columns, directiveName, elementName) {
			if (element.children()) {
				element.children().remove();
			}

			columns.forEach(function (column) {
				var options = {
					directive: column[directiveName],
					clazz: column.clazz || '',
					id: column.id
				};

				if (!column.visible) {
					options.clazz = options.clazz + " ng-hide";
				}

				if (column.scopedAttrs && angular.isObject(column.scopedAttrs)) {
					options.scopedAttrs = column.scopedAttrs;
				}

				element.append($compile(createElement(elementName, options))(scope));
			});
		}

		function renderRow(scope, element, columns) {
			render(scope, element, columns, "rowDirective", "td");
		}

		function renderColumn(scope, element, columns) {
			render(scope, element, columns, "columnDirective", "th");
		}

		function toggleColumn($element, toggledColumnId) {
			var columnElement, columnId, children = $element.children();

			Object.keys(children).some(function (key) {
				columnElement = children[key];
				columnId = columnElement.attributes["data-col-id"].value;

				if (columnId === toggledColumnId) {
					columnElement = angular.element(columnElement);
					if (columnElement.hasClass("ng-hide")) {
						angular.element(columnElement).removeClass("ng-hide");
					} else {
						angular.element(columnElement).addClass("ng-hide");
					}
					return true;
				}
			});
		}

		function changeColumnOrder($element, source, dest) {
			var forward = false, temp, children = $element.children(),
				sourceElement, destElement, sourceIndex, destIndex;
			console.log("changeorder", $element, source, dest);
			Object.keys(children).some(function (key, index) {
				var columnId = children[key].attributes["data-col-id"].value;

				if (columnId === source) {
					sourceElement = angular.element(children[key]);
					sourceIndex = index;
				} else if (columnId === dest) {
					destElement = angular.element(children[key]);
					destIndex = index;

					if (!sourceElement) {
						forward = true;
					}
				}

				if (sourceElement && destElement) {
					return true;
				}
			});


			if (sourceElement && destElement) {
				if (forward) {
					//TODO moving forward only with dom api methods doesn't work (aka without jquery)
					//temp = destElement.after(sourceElement);
					//sourceElement.after(temp);
					destElement.before(sourceElement);

				} else {
					destElement.after(sourceElement);
				}

				return {
					destIndex: destIndex,
					sourceIndex: sourceIndex
				};
			}

			return null;
		}

		return {
			renderRow: renderRow,
			renderColumn: renderColumn,
			toggleColumn: toggleColumn,
			changeColumnOrder: changeColumnOrder
		};
	}]);

})(angular);
