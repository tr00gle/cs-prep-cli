const fs = require('fs');
const EventEmitter = require('events');

const { makeFileDate } = require('./helpers/date');

class NotesServer extends EventEmitter {
  constructor(client) {
    super();
    this.tasks = {};
    this.taskId = 1;
    process.nextTick(() => {
      this.emit(
        'init',
        'Type a command. Type "help" to list commands.'
      );
    });

    process.on('exit', () => {
      const textContents = this.tasksString();
      fs.writeFileSync(`./${makeFileDate()}-tasks.txt`, textContents);
      this.emit('exit');
    });

    client.on('command', (command, args) => {
      switch (command) {
        case 'help':
        case 'add':
        case 'ls':
        case 'delete':
        case 'exit':
          this[command](args);
          break;
        default:
          this.emit('response', 'Unknown command. Type "help" to list commands.');
      }
    });
  }

  tasksString() {
    return Object.keys(this.tasks).map(key => {
      return `${key}. ${this.tasks[key]}`;
    }).join('\n');
  }
  help() {
    this.emit(
      'response', 
    `Available Commands:
  add task
  ls
  delete :id`
    );
  }
  add(args) {
    this.tasks[this.taskId] = args.join(' ');
    this.emit('response', `Added task ${this.taskId}`);
    this.taskId++;
  }
  ls() {
    this.emit('response', `Tasks:\n${this.tasksString()}`);
  }
  delete(args) {
    delete(this.tasks[args[0]]);
    this.emit('response', `Deleted task ${args[0]}`);
  }

  exit() {
    process.exit();
  }
}

module.exports = (client) => new NotesServer(client);
