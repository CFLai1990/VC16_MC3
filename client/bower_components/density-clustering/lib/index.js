
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      DBSCAN: require('./DBSCAN.js'),
      KMEANS: require('./KMEANS.js'),
      OPTICS: require('./OPTICS.js'),
      PriorityQueue: require('./PriorityQueue.js')
    };
}
