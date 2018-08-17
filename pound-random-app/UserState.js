import { Container } from 'unstated';
import api from './Api';

class UserStateContainer extends Container {
  constructor(...args) {
    super(...args);

    setInterval(async () => {
      const userId = await api.getUserIdAsync();

      if ((userId && !this.state.userId) || userId !== this.state.userId) {
        this.setState({ userId });
      }
    }, 500);
  }

  state = {
    userId: null,
  };
}

export default new UserStateContainer();
