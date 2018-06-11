import Expo from 'expo';
import React from 'react';
import { AsyncStorage, Button, Dimensions, Modal, Text, TouchableHighlight, View } from 'react-native';

import { getBaseUrlAsync } from './Api';

let { width, height } = Dimensions.get("window");

export default class QRCodeUrlReader extends React.Component {

  state = {
    hasCameraPermission: null,
    modalVisible: false,
    BASE_URL: null,
  };

  componentDidMount() {
    this._requestCameraPermission();
    this._getBaseUrlAsync();
  }

  _getBaseUrlAsync = async () => {
    let BASE_URL = await getBaseUrlAsync();
    this.setState({BASE_URL});
  }

  _requestCameraPermission = async () => {
    const { status } = await Expo.Permissions.askAsync(Expo.Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };

  _handleBarCodeRead = (data) => {
    console.log("scanned ", data);
    this._onUrl(data.data);
    this.setState({modalVisible: false});
  };

  _onUrl(url) {
    this._onUrlAsync(url);
  }

  _onUrlAsync = async (url) => {
    await AsyncStorage.setItem("BASE_URL", url);
    this.setState({BASE_URL: url});
  }

  render() {
    return (
      <View>
        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <View>
            <TouchableHighlight onPress={() => { this.setState({ modalVisible: false }); }} >
              <Expo.BarCodeScanner
                onBarCodeRead={this._handleBarCodeRead}
                style={{ width, height }}
              />
            </TouchableHighlight>
          </View>
        </Modal >
        <Button title="Scan QR Code" onPress={() => {
          this.setState({ modalVisible: true });
        }} />
        <Button title="Use production API server" onPress={() => {
          this._onUrl("http://poundrandom.render.com/");
        }} />
        <Text>Currently using {this.state.BASE_URL}</Text>
      </View >
    );
  }
}
