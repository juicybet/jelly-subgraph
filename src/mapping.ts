import { BetAccepted, BetCancelled, BetConcluded, BetCreated } from '../generated/Jelly/Jelly'
import { JellyBet, Transaction } from '../generated/schema'
import { Jelly } from '../generated/Jelly/Jelly'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'

let tenK = BigInt.fromI32(10000)
let zero = BigInt.fromI32(0)
let zeroAddress = Address.fromString('0x' + '0'.repeat(40))

function createTx(event: ethereum.Event): string {
  let tx = new Transaction(event.transaction.hash.toHex())
  tx.block = event.block.number
  tx.timestamp = event.block.timestamp
  tx.save()

  return tx.id
}

export function handleBetCreated(event: BetCreated): void {
  let jellyBet = new JellyBet(event.params.id.toHex())

  jellyBet.creator = event.params.creator
  jellyBet.bet = event.params.bet
  jellyBet.value = event.params.value
  jellyBet.createdTx = createTx(event)

  jellyBet.save()
}

export function handleBetCancelled(event: BetCancelled): void {
  let id = event.params.id.toHex()
  let jellyBet = JellyBet.load(id)
  let jelly = Jelly.bind(event.address)

  jellyBet.cancelledTx = createTx(event)

  let feeDeducted = jellyBet.value.times(BigInt.fromI32(jelly.cancellationFee())).div(tenK)

  jellyBet.feeDeducted = feeDeducted
  jellyBet.refundReceived = jellyBet.value.minus(feeDeducted)

  jellyBet.save()
}

export function handleBetAccepted(event: BetAccepted): void {
  let id = event.params.id.toHex()
  let jellyBet = JellyBet.load(id)

  jellyBet.joiner = event.params.joiner
  jellyBet.acceptedTx = createTx(event)

  jellyBet.save()
}

export function handleBetConcluded(event: BetConcluded): void {
  let id = event.params.id.toHex()
  let jellyBet = JellyBet.load(id)
  let jelly = Jelly.bind(event.address)

  jellyBet.result = event.params.result
  jellyBet.referrer = event.params.referrer
  jellyBet.concludedTx = createTx(event)

  let hasReferrer = !event.params.referrer.equals(zeroAddress)
  let referralBonus = hasReferrer ? jellyBet.value.times(BigInt.fromI32(jelly.referralRate())).div(tenK) : zero
  let feeDeducted = jellyBet.value.times(BigInt.fromI32(jelly.commissionRate())).div(tenK).minus(referralBonus)

  jellyBet.referralBonus = referralBonus
  jellyBet.feeDeducted = feeDeducted
  jellyBet.rewardReceived = jellyBet.value.minus(feeDeducted).minus(referralBonus)

  jellyBet.save()
}
