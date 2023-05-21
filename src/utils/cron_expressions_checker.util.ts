import { isValidCron } from 'cron-validator'

function isCronExpressionValid(cronExpression: string) {
  return isValidCron(cronExpression, {
    seconds: true,
    alias: true,
    allowSevenAsSunday: true
  })
}

export default isCronExpressionValid
