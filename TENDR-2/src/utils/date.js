const { format, parseISO, startOfDay, endOfDay } = require('date-fns');

const formatDate = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'yyyy-MM-dd');
};

const getStartOfDay = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(parsedDate);
};

const getEndOfDay = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(parsedDate);
};

const calculateDateRange = (timeframe = '30d') => {
  // Extract number of days (support "30d" format)
  const days = parseInt(timeframe.replace(/\D/g, ''), 10) || 30; 
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: getStartOfDay(startDate),
    endDate: getEndOfDay(endDate),
  };
};

const isDateInRange = (date, startDate, endDate) => {
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  return checkDate >= startDate && checkDate <= endDate;
};

module.exports = {
  formatDate,
  getStartOfDay,
  getEndOfDay,
  calculateDateRange,
  isDateInRange,
};
