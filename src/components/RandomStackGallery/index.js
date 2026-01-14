import React, { Component } from 'react'
import { View, Image, StyleSheet, Platform, ActivityIndicator, Text } from 'react-native'

function normalizeImageValue(img) {
  if (!img && img !== 0) return null

  if (typeof img === 'string') {
    return { rnSource: { uri: img }, url: img }
  }

  if (typeof img === 'object') {
    if (img.uri) {
      return { rnSource: img, url: img.uri }
    }

    if (img.image) {
      if (typeof img.image === 'string') {
        return { rnSource: { uri: img.image }, url: img.image }
      }
      if (img.image.uri) {
        return { rnSource: { uri: img.image.uri }, url: img.image.uri }
      }
    }

    if (img.url) {
      return { rnSource: { uri: img.url }, url: img.url }
    }
  }

  if (typeof img === 'number') {
    return { rnSource: img, url: null }
  }

  return null
}

function getRandomValue(min, max) {
  return Math.random() * (max - min) + min
}

function getImageSource(imageSource) {
  if (!imageSource) {
    return null
  }

  if (typeof imageSource === 'object' && typeof imageSource.value === 'object') {
    return imageSource.value
  }

  return imageSource
}

class RandomStackGallery extends Component {
  static defaultProps = {
    maxItems: 5,
    _width: 320,
    _height: 400,
  }

  processImages = () => {
    const { images = [], maxItems = 5, imageSize = 60, _width = 320, _height = 400 } = this.props

    const containerWidth = _width || 320
    const containerHeight = _height || 400

    if (!images || !Array.isArray(images) || images.length === 0) {
      return []
    }

    try {
      const imageList = images.map(item => {
        if (item && item.image) {
          return item.image
        }
        return item
      })

      const validImages = imageList
        .map(normalizeImageValue)
        .filter(img => img !== null)
        .slice(0, maxItems)

      if (validImages.length === 0) {
        return []
      }

      const sizePercentage = Math.max(30, Math.min(100, imageSize)) / 100
      const baseSize = Math.min(containerWidth, containerHeight) * sizePercentage
      const sizeVariation = baseSize * 0.25

      return validImages.map((img, index) => {
        const calculatedSize = baseSize + getRandomValue(-sizeVariation, sizeVariation)
        const minSize = Math.min(containerWidth, containerHeight) * 0.2
        const maxSize = Math.min(containerWidth, containerHeight) * 0.8
        const finalSize = Math.max(minSize, Math.min(calculatedSize, maxSize))

        const maxLeft = Math.max(0, containerWidth - finalSize)
        const maxTop = Math.max(0, containerHeight - finalSize)

        const left = getRandomValue(0, maxLeft)
        const top = getRandomValue(0, maxTop)

        return {
          ...img,
          id: index,
          size: finalSize,
          rotation: getRandomValue(-8, 8),
          left: left,
          top: top,
          zIndex: index
        }
      })
    } catch (error) {
      console.error('Error processing images:', error)
      return []
    }
  }

  renderEmptyState() {
    const { listEmptyState, _width = 320, _height = 400 } = this.props

    if (!listEmptyState) {
      return null
    }

    const {
      emptyStateImageStatus = 'noImage',
      imageSource,
      textTitleDisplay = 'titleOnly',
      title = 'No Images',
      subtitle = 'Add images to see the gallery',
      styles: emptyListStyles = {},
    } = listEmptyState

    const containerWidth = _width || 320
    const containerHeight = _height || 400

    const realImageSource = getImageSource(imageSource)
    const imageWrapperSize = { width: 170, height: 170 }

    const titleStyle = emptyListStyles.title || {}
    const subtitleStyle = emptyListStyles.subtitle || {}

    return (
      <View style={[styles.emptyStateContainer, { width: containerWidth, height: containerHeight }]}>
        {emptyStateImageStatus === 'above' && realImageSource && (
          <View style={[styles.emptyImageWrapper, imageWrapperSize, { marginBottom: textTitleDisplay !== 'noText' ? 32 : 0 }]}>
            <Image
              resizeMode="cover"
              style={styles.emptyImage}
              source={realImageSource}
              pointerEvents="none"
            />
          </View>
        )}

        {textTitleDisplay !== 'noText' && (
          <View style={styles.emptyTextContainer}>
            {textTitleDisplay === 'titleAndSubtitle' && (
              <Text style={[styles.emptyTitle, titleStyle]}>{title}</Text>
            )}
            {textTitleDisplay === 'titleOnly' && (
              <Text style={[styles.emptyTitle, titleStyle]}>{title}</Text>
            )}
            {textTitleDisplay === 'titleAndSubtitle' && (
              <Text style={[styles.emptySubtitle, subtitleStyle]}>{subtitle}</Text>
            )}
          </View>
        )}

        {emptyStateImageStatus === 'below' && realImageSource && (
          <View style={[styles.emptyImageWrapper, imageWrapperSize, { marginTop: textTitleDisplay !== 'noText' ? 32 : 0 }]}>
            <Image
              resizeMode="cover"
              style={styles.emptyImage}
              source={realImageSource}
              pointerEvents="none"
            />
          </View>
        )}
      </View>
    )
  }

  render() {
    try {
      const { images, _width = 320, _height = 400, openAccordion, listEmptyState } = this.props

      const containerWidth = _width || 320
      const containerHeight = _height || 400

      if (images === null || images === undefined) {
        return (
          <View style={[styles.container, { width: containerWidth, height: containerHeight, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color="#999999" />
          </View>
        )
      }

      const processedImages = this.processImages()
      const hasImages = Array.isArray(images) && images.length > 0
      const hasProcessedImages = Array.isArray(processedImages) && processedImages.length > 0

      const renderEmptyState = listEmptyState && ((!hasImages || !hasProcessedImages) || openAccordion === 'listEmptyState')

      if (renderEmptyState) {
        return this.renderEmptyState()
      }

      if (!hasProcessedImages) {
        return (
          <View style={[styles.container, { width: containerWidth, height: containerHeight }]} />
        )
      }

      return (
        <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
          {processedImages.map((imgData) => {
            if (!imgData || !imgData.rnSource) {
              return null
            }

            const imageStyle = {
              width: imgData.size,
              height: imgData.size,
              transform: [{ rotate: `${imgData.rotation}deg` }],
              position: 'absolute',
              left: imgData.left,
              top: imgData.top,
              zIndex: imgData.zIndex,
              borderRadius: 10,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                },
                android: {
                  elevation: 5,
                },
                web: {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                },
              }),
            }

            return (
              <Image
                key={imgData.id || `img-${imgData.id}`}
                source={imgData.rnSource}
                style={imageStyle}
                resizeMode="contain"
              />
            )
          })}
        </View>
      )
    } catch (error) {
      console.error('RandomStackGallery render error:', error)
      const { _width = 320, _height = 400 } = this.props
      return (
        <View style={[styles.container, { width: _width || 320, height: _height || 400, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.errorText}>Error loading gallery</Text>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyImageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  emptyTextContainer: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
    color: '#212121',
  },
  errorText: {
    color: '#999',
    fontSize: 14,
  },
})

export default RandomStackGallery
