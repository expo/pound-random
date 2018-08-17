import React, { PureComponent } from 'react';
import {
  View,
  FlatList,
  Keyboard,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import config from '../giphy';
import { Constants } from 'expo';

import { isEmpty, range, debounce } from 'lodash';
import { FetchCache } from '../FetchCache';
import Modal from 'react-native-root-modal';
import { createStackNavigator, SafeAreaView } from 'react-navigation';

import colors from '../colors';
import styled from 'styled-components';

const IMAGE_SIZE = { width: 150, height: 100 };
const SearchBar = styled.TextInput`
  color: black;
  background-color: white;
  border-radius: 8px;
  padding-horizontal: 16px;
  flex: 1;
  margin-left: 8px;
  font-family: InterUI Medium;
`;

export class GiphyModal extends PureComponent {
  static defaultProps = {
    visible: false,
    onCancelPress: () => {},
    onGifSelect: null,
  };

  constructor(props) {
    super(props);
    this.mounted = false;
  }

  state = {
    gifs: [],
    query: '',
    selected: null,
  };

  componentDidMount() {
    this.mounted = true;
    this.searchGIF('');
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleGIFSelect = (gif) => {
    const { onGifSelect } = this.props;
    onGifSelect(gif);
    this.setState({ selected: null });
  };

  handleCancelPress = () => {
    const { onCancelPress } = this.props;
    onCancelPress();
    this.setState({ selected: null });
  };

  handleSearchStateChange = (query) => {
    this.setState({ query }, () => {
      this.debouncedSearch(query);
    });
  };

  searchGIF = async (query) => {
    const empty = isEmpty(query.trim());
    const api = empty ? config.trending : config.endpoint;

    // Build the params
    let params = `api_key=${config.apiKey}`;
    if (!empty) params += `&q=${query}`;

    // Build the URL
    const url = `${api}${params}`;

    // Fetch the GIFS!
    try {
      const giphy = await FetchCache.get(url);
      const gifs = giphy.data;

      if (this.mounted) this.setState({ gifs });
    } catch (e) {
      console.log(e);
    }
  };
  debouncedSearch = debounce(this.searchGIF, 150);

  renderItem = (item, spacing) => {
    const images = item.images;

    const downsized = images.downsized_small && images.downsized_small.url;
    const fixedWidth = images.fixed_width && images.fixed_width.url;

    return (
      <View>
        <TouchableOpacity onPress={() => this.setState({ selected: item })}>
          <Image
            source={{ uri: (images && (downsized || fixedWidth)) || '' }}
            style={{
              height: 100,
              width: 150,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const { visible } = this.props;
    const { gifs, selected, query } = this.state;

    return (
      <Modal
        visible
        style={{
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          position: 'absolute',
          backgroundColor: 'black',
        }}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: 'black',
          }}
          forceInset={{ top: Platform.OS === 'android' ? 'never' : 'always' }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={!__DEV__ ? 'padding' : Platform.OS === 'ios' ? 'padding' : null}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
              <TouchableOpacity
                onPress={this.props.close}
                style={{
                  backgroundColor: colors.white20,
                  padding: 8,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'InterUI Medium' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <SearchBar
                autoFocus
                autoCorrect={false}
                onChangeText={this.handleSearchStateChange}
                placeholder="Search Giphy"
                underlineColorAndroid="transparent"
                placeholderTextColor="rgba(0,0,0,0.5)"
              />
            </View>
            <FlatList
              data={gifs}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    this.props.onGifSelect(item.images.downsized.url);
                  }}>
                  <Image
                    source={{
                      uri: item.images.downsized.url,
                      height: Dimensions.get('window').width / 2 / (4 / 3),
                      width: Dimensions.get('window').width / 2,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  }
}
