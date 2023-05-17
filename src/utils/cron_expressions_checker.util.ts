import CronParser from 'cron-parser'

function isCronExpressionValid(cronExpression: string) {
  try {
    CronParser.parseExpression(cronExpression)
    return true
  } catch (error) {
    return false
  }
}

export default isCronExpressionValid
