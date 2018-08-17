import styled from 'styled-components';
import colors from '../../../colors';

export default styled.TouchableOpacity`
  background-color: white;
  margin-horizontal: 16px;
  margin-bottom: ${({ last }) => (last ? 8 : 0)}px;
`;
