import { BetAccepted, BetCancelled, BetConcluded, BetCreated } from '../generated/Jelly/Jelly'
import { JellyBet } from '../generated/schema'

export function handleBetCreated(event: BetCreated): void {
  let jellyBet = new JellyBet(event.params.id.toHex())

  jellyBet.creator = event.params.creator
  jellyBet.bet = event.params.bet
  jellyBet.value = event.params.value
  jellyBet.createdTx = event.transaction.hash
  jellyBet.createdOn = event.block.timestamp

  jellyBet.cancelled = false
  jellyBet.concluded = false
  jellyBet.accepted = false

  jellyBet.save()
}

export function handleBetCancelled(event: BetCancelled): void {
  let id = event.params.id.toHex()
  let jellyBet = JellyBet.load(id)

  jellyBet.cancelled = true
  jellyBet.cancelledTx = event.transaction.hash
  jellyBet.cancelledOn = event.block.timestamp

  jellyBet.save()
}

export function handleBetAccepted(event: BetAccepted): void {
  let id = event.params.id.toHex()
  let jellyBet = JellyBet.load(id)

  jellyBet.joiner = event.params.joiner

  jellyBet.accepted = true
  jellyBet.acceptedTx = event.transaction.hash
  jellyBet.acceptedOn = event.block.timestamp

  jellyBet.save()
}

export function handleBetConcluded(event: BetConcluded): void {
  let id = event.params.id.toHex()
  let jellyBet = JellyBet.load(id)

  jellyBet.result = event.params.result
  jellyBet.referrer = event.params.referrer

  jellyBet.concluded = true
  jellyBet.concludedTx = event.transaction.hash
  jellyBet.concludedOn = event.block.timestamp

  jellyBet.save()
}
