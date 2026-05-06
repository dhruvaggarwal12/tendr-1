const analyticsHelpers = {
  aggregateByDay: (items, dateField, valueField = null) => {
    return items.reduce((acc, item) => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      if (valueField) {
        acc[date] = (acc[date] || 0) + item[valueField];
      } else {
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});
  },
  aggregatePopularServices: (bookings) => {
    return bookings.reduce((acc, booking) => {
      (booking.services || []).forEach(service => {
        acc[service] = (acc[service] || 0) + 1;
      });
      return acc;
    }, {});
  },
  aggregateEventTypes: (bookings) => {
    return bookings.reduce((acc, booking) => {
      acc[booking.eventType] = (acc[booking.eventType] || 0) + 1;
      return acc;
    }, {});
  },
  aggregateViewSources: (views) => {
    return views.reduce((acc, view) => {
      acc[view.source] = (acc[view.source] || 0) + 1;
      return acc;
    }, {});
  },
  calculateVendorScore: (vendor, userPreferences = {}) => {
    let score = 0;
    score += (vendor.totalEventsCompleted || 0) * 0.4;
    score += (vendor.yearsOfExperience || 0) * 0.2;
    if (userPreferences.eventType && vendor.eventTypes === userPreferences.eventType) {
      score += 0.2;
    }
    if (userPreferences.location && Array.isArray(vendor.locations)) {
      if (vendor.locations.includes(userPreferences.location)) {
        score += 0.1;
      }
    }
    return score;
  },
  calculatePriceRange: (bookings) => {
    if (!bookings.length) return null;
    const prices = bookings.map(b => b.totalAmount);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return [minPrice, maxPrice];
  }
};

module.exports = analyticsHelpers; 