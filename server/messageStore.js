/* abstract */ class MessageStore {
  saveMessage(message) {}
  findMessagesForUser(userId) {}
}

export class InMemoryMessageStore extends MessageStore {
  constructor() {
    super()
    this.messages = []
  }

  saveMessage(message) {
    this.messages.push(message)
  }

  findMessagesForUser(userId) {
    return this.messages.filter(({ from, to }) => from === userId || to === userId)
  }
}
