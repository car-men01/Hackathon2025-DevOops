"""
QR Code Service - Generate QR codes from URLs/links
"""
import qrcode
from io import BytesIO
import base64
import logging

logger = logging.getLogger(__name__)


class QRService:
    """Service for generating QR codes from links."""

    @staticmethod
    def generate_qr_code(
        link: str,
        fill_color: str = "black",
        back_color: str = "white",
        box_size: int = 10,
        border: int = 4
    ) -> BytesIO:
        """
        Generate a QR code from a link and return as BytesIO.

        Args:
            link: The URL/link to encode in the QR code
            fill_color: Color of the QR code (default: black)
            back_color: Background color (default: white)
            box_size: Size of each box in pixels (default: 10)
            border: Border size in boxes (default: 4)

        Returns:
            BytesIO object containing the PNG image
        """
        try:
            # Create QR code instance
            qr = qrcode.QRCode(
                version=1,  # Controls size (1 is smallest, auto-adjusts if needed)
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=box_size,
                border=border,
            )

            # Add data
            qr.add_data(link)
            qr.make(fit=True)

            # Create image
            img = qr.make_image(fill_color=fill_color, back_color=back_color)

            # Save to BytesIO
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)

            logger.info(f"QR code generated successfully for link: {link[:50]}...")
            return buffer

        except Exception as e:
            logger.error(f"Error generating QR code: {str(e)}")
            raise

    @staticmethod
    def generate_qr_code_base64(
        link: str,
        fill_color: str = "black",
        back_color: str = "white",
        box_size: int = 10,
        border: int = 4
    ) -> str:
        """
        Generate a QR code and return as base64 encoded string.

        Args:
            link: The URL/link to encode in the QR code
            fill_color: Color of the QR code (default: black)
            back_color: Background color (default: white)
            box_size: Size of each box in pixels (default: 10)
            border: Border size in boxes (default: 4)

        Returns:
            Base64 encoded string of the PNG image
        """
        try:
            buffer = QRService.generate_qr_code(
                link=link,
                fill_color=fill_color,
                back_color=back_color,
                box_size=box_size,
                border=border
            )

            # Encode to base64
            base64_image = base64.b64encode(buffer.getvalue()).decode('utf-8')

            logger.info(f"QR code base64 generated for link: {link[:50]}...")
            return base64_image

        except Exception as e:
            logger.error(f"Error generating base64 QR code: {str(e)}")
            raise

    @staticmethod
    def generate_qr_code_data_url(
        link: str,
        fill_color: str = "black",
        back_color: str = "white",
        box_size: int = 10,
        border: int = 4
    ) -> str:
        """
        Generate a QR code and return as data URL (ready for HTML img src).

        Args:
            link: The URL/link to encode in the QR code
            fill_color: Color of the QR code (default: black)
            back_color: Background color (default: white)
            box_size: Size of each box in pixels (default: 10)
            border: Border size in boxes (default: 4)

        Returns:
            Data URL string (data:image/png;base64,...)
        """
        try:
            base64_image = QRService.generate_qr_code_base64(
                link=link,
                fill_color=fill_color,
                back_color=back_color,
                box_size=box_size,
                border=border
            )

            # Create data URL
            data_url = f"data:image/png;base64,{base64_image}"

            logger.info(f"QR code data URL generated for link: {link[:50]}...")
            return data_url

        except Exception as e:
            logger.error(f"Error generating data URL QR code: {str(e)}")
            raise


# Convenience function for quick QR code generation
def create_qr_code(link: str) -> BytesIO:
    """
    Quick function to generate a QR code from a link.

    Args:
        link: The URL/link to encode

    Returns:
        BytesIO object containing the PNG image
    """
    return QRService.generate_qr_code(link)

